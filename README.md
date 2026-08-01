# Ishan Kulkarni

I study CS (AIML) at KIT Kolhapur, but most of what I've learned came from building things that don't fit a syllabus — a robot head that tracks faces and talks back with a local LLM, an NFC tag that starts recording a lecture the moment you tap it, software that reads a book and answers questions about it. I like the seam between hardware and software more than either side alone.

I founded the AI & Robotics Club at KIT Kolhapur. It's grown to 120+ members, and about 1500 students have been through something the club has run — a workshop, a build session, a talk. In 2020, a project of mine placed top 20 internationally at Techfest, IIT Bombay. Somewhere along the way I also picked up certifications in LLM Engineering and Python, for whatever that's worth.

## Right now

**[DeskPanda](https://deskpanda.io)** — a task manager for teams that's trying to stay out of the way instead of demanding its own workflow.

**[GyanBrige](https://github.com/IshanKulkarni02/GyanBrige)** — a self-hosted LMS for colleges: live classes, notes generated from them automatically, attendance, and a place for students to actually talk to each other. One codebase, running on web, mobile, and desktop (Expo, Tauri, Fastify, tRPC, LiveKit).

**[AudioMixer](https://github.com/IshanKulkarni02/Mac_audio_mixer)** — a macOS audio mixer: a virtual output device any app can play into, with per-application and hardware input strips mixed and routed from a native SwiftUI control surface. Rust DSP core, a user-space Core Audio HAL plugin (no kernel extension) written against Apple's public AudioServerPlugIn.h, SwiftUI on top.

**[dbhelm](https://github.com/IshanKulkarni02/mongo-backup-tool)** — a cross-platform tool for backing up, restoring, and version-controlling MongoDB databases, local or Atlas. Full-fidelity backups via the official MongoDB tools, plus git-like content-addressed snapshots for cheap, diffable checkpoints. One core exposed as a CLI, a terminal UI, and a desktop app.

Alongside those: an LMS where tapping an NFC tag starts a WebRTC lecture recording, and a RAG pipeline (Unsloth + Ollama) that answers questions about a book by actually reading it first.

## Things I've built before

| Project | Stack | What it did |
|---|---|---|
| Film Matchmaking AI | TensorFlow, Flask, CNN, LLM | Read artist and producer profiles with an LLM, then matched them with a CNN — Tinder for the film industry |
| Greeting Robot | Ollama, Flask, Raspberry Pi, OpenCV | A physical robot head that tracks faces in real time and runs a local LLM to hold a conversation |
| Communicathon App | Flutter, React Native | An assistive app for people with sensory impairments, combining speech-to-text and text-to-speech |
| FaceVault Extension | YOLO, JavaScript | A browser extension for passwordless login using your face |

## What I reach for

Python and TypeScript for most things. React or Next.js on the frontend, Node with Fastify and tRPC on the backend, Postgres or Mongo depending on the shape of the data. When a project needs to leave the browser: Flutter or React Native for mobile, Tauri for desktop, Arduino or a Raspberry Pi when it needs to leave the screen entirely. Go for small, fast CLI tools, Rust when something has to be real-time-safe, Swift when it needs to speak natively to macOS. For AI work, Ollama and Unsloth to run and fine-tune models locally, OpenCV when vision is involved, Blender when something needs to exist in 3D first.

## Reach me

Email: ishanproj@gmail.com
LinkedIn: [ishankulkarni2002](https://linkedin.com/in/ishankulkarni2002)
GitHub: [@IshanKulkarni02](https://github.com/IshanKulkarni02)
