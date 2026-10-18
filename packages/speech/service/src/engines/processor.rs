use luft_speech::types::{Engine, EngineChoice};

const WHISPER_NEEDS: [&str; 6] = ["sse4_2", "avx", "avx2", "fma", "f16c", "bmi2"];

/// What this computer's processor can run. whisper.cpp is built for processors
/// with AVX2, which nearly every one since 2013 has, and stops with an illegal
/// instruction on older ones, so it's never loaded there. ONNX Runtime picks
/// code for the processor as it runs, so Parakeet runs on any.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Processor {
    whisper: bool,
}

impl Processor {
    pub fn detect() -> Self {
        Self::from_cpuinfo(&std::fs::read_to_string("/proc/cpuinfo").unwrap_or_default())
    }

    fn from_cpuinfo(cpuinfo: &str) -> Self {
        let flags: Vec<&str> = cpuinfo
            .lines()
            .find_map(|line| {
                let (name, value) = line.split_once(':')?;
                (name.trim() == "flags").then_some(value)
            })
            .unwrap_or_default()
            .split_whitespace()
            .collect();
        Self {
            whisper: WHISPER_NEEDS.iter().all(|needed| flags.contains(needed)),
        }
    }

    pub fn runs(self, engine: Engine) -> bool {
        match engine {
            Engine::Parakeet => true,
            Engine::Whisper => self.whisper,
        }
    }

    pub fn engines(self) -> Vec<Engine> {
        [Engine::Parakeet, Engine::Whisper]
            .into_iter()
            .filter(|engine| self.runs(*engine))
            .collect()
    }

    /// The engine choice to follow: choosing Whisper where it can't run falls
    /// back to choosing by language.
    pub fn allow(self, choice: EngineChoice) -> EngineChoice {
        match choice {
            EngineChoice::Whisper if !self.whisper => EngineChoice::Automatic,
            choice => choice,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const IVY_BRIDGE: &str = "processor\t: 0\nmodel name\t: Intel(R) Core(TM) i5-3320M CPU @ 2.60GHz\nflags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx rdtscp lm constant_tsc pni pclmulqdq ssse3 cx16 sse4_1 sse4_2 x2apic popcnt aes xsave avx f16c rdrand lahf_lm fsgsbase smep erms xsaveopt\n";
    const HASWELL: &str = "processor\t: 0\nmodel name\t: Intel(R) Core(TM) i5-4300U CPU @ 1.90GHz\nflags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx rdtscp lm pni pclmulqdq ssse3 fma cx16 sse4_1 sse4_2 movbe popcnt aes xsave avx f16c rdrand lahf_lm abm fsgsbase bmi1 avx2 smep bmi2 erms invpcid xsaveopt\n";
    const JASPER_LAKE: &str = "flags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx rdtscp lm pni pclmulqdq ssse3 cx16 sse4_1 sse4_2 movbe popcnt aes rdrand lahf_lm sha_ni\n";

    #[test]
    fn whisper_needs_avx2_with_fma_f16c_and_bmi2() {
        assert!(Processor::from_cpuinfo(HASWELL).runs(Engine::Whisper));
        assert!(!Processor::from_cpuinfo(IVY_BRIDGE).runs(Engine::Whisper));
        assert!(!Processor::from_cpuinfo(JASPER_LAKE).runs(Engine::Whisper));
        assert!(!Processor::from_cpuinfo("").runs(Engine::Whisper));
    }

    #[test]
    fn parakeet_runs_on_any_processor() {
        for cpuinfo in [HASWELL, IVY_BRIDGE, JASPER_LAKE] {
            assert_eq!(
                Processor::from_cpuinfo(cpuinfo).engines()[0],
                Engine::Parakeet
            );
        }
        assert_eq!(
            Processor::from_cpuinfo(IVY_BRIDGE).engines(),
            [Engine::Parakeet]
        );
    }

    #[test]
    fn choosing_whisper_where_it_cant_run_chooses_by_language() {
        let old = Processor::from_cpuinfo(IVY_BRIDGE);
        assert_eq!(old.allow(EngineChoice::Whisper), EngineChoice::Automatic);
        assert_eq!(old.allow(EngineChoice::Parakeet), EngineChoice::Parakeet);
        let new = Processor::from_cpuinfo(HASWELL);
        assert_eq!(new.allow(EngineChoice::Whisper), EngineChoice::Whisper);
    }
}
