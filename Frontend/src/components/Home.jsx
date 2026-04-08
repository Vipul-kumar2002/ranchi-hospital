import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Float,
  Environment,
  Stars,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  ChevronRight,
  Stethoscope,
  X,
  Shield,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   3D COMPONENTS (Optimized for Hospital UI)
───────────────────────────────────────── */
const useMouse = () => {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return mouse;
};

const Syringe = ({ mouse }) => {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.3 + Math.sin(t * 0.4) * 0.08,
      0.04,
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      mouse.current.x * 0.35 + t * 0.12,
      0.04,
    );
    group.current.position.y = Math.sin(t * 0.6) * 0.18;
  });

  return (
    <group ref={group} rotation={[0.4, 0.5, -0.3]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.4, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.3}
          roughness={0.05}
          transmission={0.96}
          ior={1.5}
          chromaticAberration={0.04}
          color="#dbeafe"
          attenuationColor="#3b82f6"
          attenuationDistance={0.5}
        />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.08, 32]} />
        <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.022, 0.006, 0.32, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    </group>
  );
};

const HelixRing = ({ mouse }) => {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.25;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.15,
      0.03,
    );
  });
  return (
    <group ref={group} position={[0, 0, -1]}>
      <mesh>
        <torusGeometry args={[1.8, 0.02, 8, 120]} />
        <meshStandardMaterial
          color="#0ea5e9"
          transparent
          opacity={0.2}
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

/* ─────────────────────────────────────────
   CORE UI COMPONENTS
───────────────────────────────────────── */
const Navbar = ({ navigate }) => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-20 bg-black/10 backdrop-blur-xl border-b border-white/5">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Stethoscope size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black uppercase tracking-tighter text-lg leading-none">
            Ranchi City
          </span>
          <span className="text-blue-400 font-bold text-[10px] tracking-[0.3em] uppercase">
            Hospital
          </span>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all"
        >
          {open ? <X size={20} /> : <MoreVertical size={20} />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-4 w-56 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/admin");
                }}
                className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl text-white transition-all"
              >
                <Shield size={18} className="text-blue-500" />
                <span className="font-bold text-sm tracking-tight">
                  Admin Console
                </span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl text-white transition-all opacity-50 cursor-not-allowed"
              >
                <Users size={18} className="text-teal-500" />
                <span className="font-bold text-sm tracking-tight">
                  Patient Cloud
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const HomePage = () => {
  const mouse = useMouse();
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full bg-[#02040a] overflow-hidden selection:bg-blue-500/30">
      {/* 3D Visual Layer */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
          <Suspense fallback={null}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <Syringe mouse={mouse} />
            </Float>
            <HelixRing mouse={mouse} />
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      <Navbar navigate={navigate} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto h-full flex flex-col justify-center px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] tracking-widest uppercase">
            <Zap size={12} fill="currentColor" /> AI Powered Medical Suite
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            DIGITAL
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              PRESCRIPTION
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-lg font-medium leading-relaxed">
            Revolutionizing healthcare in Ranchi. Our AI transcribes handwritten
            doctor notes into secure, structured records in under 3 seconds.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate("/prescribe")}
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20"
            >
              START NEW RECORD
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black transition-all"
            >
              ADMIN PANEL
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer / Status Dock */}
      <footer className="absolute bottom-10 left-0 right-0 z-20 px-6 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-3xl border border-white/5">
          <div className="flex gap-10">
            <div>
              <p className="text-white font-black text-xl leading-none">
                98.2%
              </p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                Accuracy Rate
              </p>
            </div>
            <div>
              <p className="text-white font-black text-xl leading-none">
                12.5k+
              </p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                Digital Records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-teal-400 font-mono text-[10px] tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            System Live: Ranchi Node 04
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
