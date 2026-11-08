#include <linux/bpf.h>
#include <linux/in.h>

#define SEC(name) __attribute__((section(name), used))
#define __uint(name, value) int (*name)[value]
#define __type(name, value) typeof(value) *name

#define LOOPBACK_IPV4 127
#define LOOPBACK_IPV6 0x01000000
#define MAPPED_IPV4 0xffff0000

enum state { ASKED = 1, BOUND = 2 };
enum change { CHANGE_BOUND = 1, CHANGE_RELEASED = 2 };

struct event {
	__u64 cookie;
	__u32 tgid;
	__u16 port;
	__u8 protocol;
	__u8 change;
};

static void *(*bpf_map_lookup_elem)(void *map, const void *key) = (void *)BPF_FUNC_map_lookup_elem;
static long (*bpf_map_update_elem)(void *map, const void *key, const void *value, __u64 flags) =
	(void *)BPF_FUNC_map_update_elem;
static long (*bpf_map_delete_elem)(void *map, const void *key) = (void *)BPF_FUNC_map_delete_elem;
static __u64 (*bpf_get_socket_cookie)(void *ctx) = (void *)BPF_FUNC_get_socket_cookie;
static __u64 (*bpf_get_current_pid_tgid)(void) = (void *)BPF_FUNC_get_current_pid_tgid;
static long (*bpf_ringbuf_output)(void *ringbuf, void *data, __u64 size, __u64 flags) =
	(void *)BPF_FUNC_ringbuf_output;

struct {
	__uint(type, BPF_MAP_TYPE_HASH);
	__uint(max_entries, 16384);
	__type(key, __u64);
	__type(value, __u8);
} sockets SEC(".maps");

struct {
	__uint(type, BPF_MAP_TYPE_RINGBUF);
	__uint(max_entries, 1 << 18);
} events SEC(".maps");

static int tracked(__u32 protocol)
{
	return protocol == IPPROTO_TCP || protocol == IPPROTO_UDP;
}

static void ask(void *ctx)
{
	__u64 cookie = bpf_get_socket_cookie(ctx);
	__u8 state = ASKED;
	bpf_map_update_elem(&sockets, &cookie, &state, BPF_ANY);
}

static void send(__u64 cookie, __u16 port, __u8 protocol, __u8 change)
{
	struct event event = {
		.cookie = cookie,
		.tgid = bpf_get_current_pid_tgid() >> 32,
		.port = port,
		.protocol = protocol,
		.change = change,
	};
	bpf_ringbuf_output(&events, &event, sizeof(event), 0);
}

SEC("cgroup/bind4")
int bind4(struct bpf_sock_addr *ctx)
{
	if (ctx->user_port && tracked(ctx->protocol) && (ctx->user_ip4 & 0xff) != LOOPBACK_IPV4)
		ask(ctx);
	return 1;
}

SEC("cgroup/bind6")
int bind6(struct bpf_sock_addr *ctx)
{
	__u32 prefix = ctx->user_ip6[0] | ctx->user_ip6[1];
	__u32 third = ctx->user_ip6[2];
	__u32 fourth = ctx->user_ip6[3];
	int loopback = !prefix && ((!third && fourth == LOOPBACK_IPV6) ||
				   (third == MAPPED_IPV4 && (fourth & 0xff) == LOOPBACK_IPV4));
	if (ctx->user_port && tracked(ctx->protocol) && !loopback)
		ask(ctx);
	return 1;
}

static int bound(struct bpf_sock *ctx)
{
	__u64 cookie = bpf_get_socket_cookie(ctx);
	__u8 *state = bpf_map_lookup_elem(&sockets, &cookie);
	if (!state || *state != ASKED)
		return 1;
	*state = BOUND;
	send(cookie, ctx->src_port, ctx->protocol, CHANGE_BOUND);
	return 1;
}

SEC("cgroup/post_bind4")
int post_bind4(struct bpf_sock *ctx)
{
	return bound(ctx);
}

SEC("cgroup/post_bind6")
int post_bind6(struct bpf_sock *ctx)
{
	return bound(ctx);
}

static int released(void *ctx)
{
	__u64 cookie = bpf_get_socket_cookie(ctx);
	__u8 *state = bpf_map_lookup_elem(&sockets, &cookie);
	if (!state)
		return 1;
	if (*state == BOUND)
		send(cookie, 0, 0, CHANGE_RELEASED);
	bpf_map_delete_elem(&sockets, &cookie);
	return 1;
}

SEC("cgroup/connect4")
int connect4(struct bpf_sock_addr *ctx)
{
	return released(ctx);
}

SEC("cgroup/connect6")
int connect6(struct bpf_sock_addr *ctx)
{
	return released(ctx);
}

SEC("cgroup/sock_release")
int sock_release(struct bpf_sock *ctx)
{
	return released(ctx);
}

char LICENSE[] SEC("license") = "GPL";
