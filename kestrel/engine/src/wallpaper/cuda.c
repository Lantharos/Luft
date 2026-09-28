#include "cuda.h"

#include <gmodule.h>

#define CUDA_LIBRARY "libgstcuda-1.0.so.0"
#define CUDA_CONTEXT_TYPE "gst.cuda.context"
#define CU_CTX_SCHED_BLOCKING_SYNC 0x4
#define CUDA_SUCCESS 0

typedef void *CUcontext;
typedef int CUdevice;

typedef struct
{
  gboolean (*load_library) (void);
  int (*init) (unsigned int flags);
  int (*device_get) (CUdevice *device, int ordinal);
  int (*context_create) (CUcontext *context, unsigned int flags, CUdevice device);
  int (*context_pop) (CUcontext *context);
  GType (*context_get_type) (void);
  GstObject *(*context_new_wrapped) (CUcontext context, CUdevice device);
} Cuda;

static gboolean
load_cuda (Cuda *cuda)
{
  GModule *module = g_module_open (CUDA_LIBRARY, G_MODULE_BIND_LAZY | G_MODULE_BIND_LOCAL);

  return module &&
         g_module_symbol (module, "gst_cuda_load_library", (gpointer *) &cuda->load_library) &&
         g_module_symbol (module, "CuInit", (gpointer *) &cuda->init) &&
         g_module_symbol (module, "CuDeviceGet", (gpointer *) &cuda->device_get) &&
         g_module_symbol (module, "CuCtxCreate", (gpointer *) &cuda->context_create) &&
         g_module_symbol (module, "CuCtxPopCurrent", (gpointer *) &cuda->context_pop) &&
         g_module_symbol (module, "gst_cuda_context_get_type", (gpointer *) &cuda->context_get_type) &&
         g_module_symbol (module, "gst_cuda_context_new_wrapped", (gpointer *) &cuda->context_new_wrapped) &&
         cuda->load_library ();
}

static GstContext *
create_sleeping_context (void)
{
  Cuda cuda;
  CUcontext handle;
  CUdevice device;
  g_autoptr (GstObject) shared = NULL;
  GstContext *context;

  if (!load_cuda (&cuda) ||
      cuda.init (0) != CUDA_SUCCESS ||
      cuda.device_get (&device, 0) != CUDA_SUCCESS ||
      cuda.context_create (&handle, CU_CTX_SCHED_BLOCKING_SYNC, device) != CUDA_SUCCESS)
    return NULL;

  cuda.context_pop (NULL);
  shared = cuda.context_new_wrapped (handle, device);
  context = gst_context_new (CUDA_CONTEXT_TYPE, TRUE);
  gst_structure_set (gst_context_writable_structure (context),
                     CUDA_CONTEXT_TYPE, cuda.context_get_type (), shared,
                     "cuda-device-id", G_TYPE_UINT, 0,
                     NULL);
  return context;
}

void
wallpaper_cuda_answer (GstMessage *context_request)
{
  static GstContext *context;
  const char *type;

  gst_message_parse_context_type (context_request, &type);
  if (!g_str_equal (type, CUDA_CONTEXT_TYPE))
    return;

  if (!context)
    context = create_sleeping_context ();
  if (context)
    gst_element_set_context (GST_ELEMENT (GST_MESSAGE_SRC (context_request)), context);
}
