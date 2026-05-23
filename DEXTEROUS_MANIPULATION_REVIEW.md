# Dexterous Manipulation Literature Review

Last verified: 2026-05-23

## Scope

This review focuses on recent and influential work around dexterous robot manipulation, especially multi-finger hands, dexterous arm-hand systems, real-world RL, imitation/data pipelines, VLA policies, and world-model / WAM directions. I included recent 2024-2026 papers where primary sources were available, and a small set of classics that define the technical lineage.

The main conclusion is that the field is moving from task-specific sim-to-real RL toward hybrid systems: human data for coverage, RL for contact-level improvement, VLA for task semantics, and world/action models for prediction and planning. The unresolved bottleneck is still fingertip-level contact: current large policies often understand what should happen, but are weak at predicting exactly how contact, force, slip, and hand morphology change the outcome.

## Method Development Line

### 1. Sim-to-real RL established the first credible dexterous hand results

OpenAI Dactyl showed that a Shadow Hand policy trained entirely in randomized simulation could transfer to real in-hand reorientation. DeXtreme later made this more practical with Allegro Hand, Isaac Gym, and vision-based pose estimation. DexPoint added point-cloud RL for category-level sim-to-real generalization. These works proved that RL can discover finger gaits and multi-finger coordination, but the cost is heavy simulator engineering, reward design, and very large training budgets.

Key limitation: these systems are often task-specialized. They succeed when the task, object class, simulator randomization, and state estimator are all carefully chosen.

### 2. Benchmarks and synthetic data changed the problem from "can it work" to "can it generalize"

Bi-DexHands, DexArt, RoboPianist, DexGraspNet 2.0, DexGrasp Anything, and Dex1B moved the field toward scale and evaluation. The datasets are important because dexterity fails in the tail: object geometry, clutter, articulation, hand morphology, and contact discontinuities matter. DexGraspNet 2.0 and Dex1B are especially relevant because they use large-scale generative grasp/manipulation data and report sim-to-real evidence.

Key limitation: synthetic scale helps coverage, but synthetic contacts, tactile signals, and deformable/articulated object physics still mismatch reality.

### 3. Human data pipelines became the main answer to data scarcity

DexCap, DexMimicGen, DexUMI, DexWild, ManipTrans, DexMachina, Dexplore, and DexCanvas all address the same core issue from different angles: robot dexterity needs human-like hand-object interaction data, but direct teleoperation of high-DoF robot hands is expensive and unnatural. The trend is toward hybrid human-real-sim data: collect human hands cheaply, retarget or reconstruct intent, use simulation or RL to make trajectories physically feasible, then train robot policies.

Key limitation: human-to-robot transfer is not a solved mapping problem. Hands differ in kinematics, actuation, compliance, tactile sensing, and reachable contacts. The best recent methods avoid strict trajectory cloning and instead preserve object intent, contact function, or soft constraints.

### 4. Real-world RL is re-entering as a refinement and data-generation tool

HIL-SERL, DexGraspRL, DexterityGen, DexHiL, and the 2025 humanoid sim-to-real RL work show that RL is no longer only a simulator-side engine. It can refine imitation policies, discover faster cycles, add corrective data, or pretrain reusable low-level dexterity primitives. The most convincing systems combine demonstrations, human interventions, learned reward/classifier signals, and policy regularization rather than running naive online RL from scratch.

Key limitation: real-world RL still needs safety envelopes, resets, intervention tools, and careful task selection. It is a high-quality data flywheel, not a fully autonomous general solution yet.

### 5. VLA policies add semantics, but contact remains the hard part

DexVLA, DexGraspVLA, shared-autonomy arm-hand VLA, DexHiL, MoDE-VLA, and Dexora move dexterous manipulation into the foundation-model era. Their value is not only language. They provide cross-task representations, long-horizon conditioning, and scalable action decoders. However, most VLA successes are strongest when low-level dexterity is assisted by diffusion experts, tactile/residual adapters, shared autonomy, corrective teleoperation, or pre-trained dexterous primitives.

Key limitation: a VLM can identify "the red cap" and infer "twist it", but it does not inherently know the torque, contact patch, slip threshold, or finger gait.

### 6. World models and WAMs are the most promising but least settled direction

DexWM and Scaling Cross-Embodiment World Models are directly relevant to dexterous hands because they model future hand-object interactions with action representations that can bridge human and robot embodiments. The broader 2026 WAM family, including WAM, GigaWorld-Policy, MotuBrain, OA-WAM, AIM, STARRY, and HarmoWAM, is mostly evaluated on general manipulation benchmarks rather than dexterous hands. Still, it offers the right architectural pressure: make future prediction action-relevant, object-addressable, spatially grounded, and cheap enough for closed-loop control.

Key limitation: video prediction alone is not enough for dexterous hands. Future models need contact, tactile, proprioceptive, and object-slot structure, otherwise they may produce plausible videos that are not actionable for a hand.

## Paper Table

| # | Paper | Year / venue status | Why it matters | Method family | Evidence and limitation |
|---|---|---:|---|---|---|
| 1 | [Learning Dexterous In-Hand Manipulation](https://arxiv.org/abs/1808.00177) | 2018 arXiv, IJRR 2019/2020 | Classic Dactyl result for real Shadow Hand reorientation. | Sim-to-real RL, domain randomization | Strong milestone, but task-specific and compute-heavy. |
| 2 | [DeXtreme](https://arxiv.org/abs/2210.13702) | 2022 arXiv, ICRA 2023 | Practical Allegro Hand sim-to-real in-hand manipulation. | GPU-sim RL, vision pose estimation | Strong real transfer, but still centered on reorientation. |
| 3 | [Bi-DexHands](https://arxiv.org/abs/2206.08686) | NeurIPS Datasets and Benchmarks 2022 | Bimanual dexterous benchmark with many tasks and objects. | RL benchmark | Shows multi-task/few-shot RL weakness in high-DoF hands. |
| 4 | [DexPoint](https://arxiv.org/abs/2211.09423) | CoRL 2022 | Point-cloud RL for sim-to-real dexterous grasping. | Point-cloud RL, contact reward | Important category-level generalization, but scope is still grasping. |
| 5 | [RoboPianist](https://arxiv.org/abs/2304.04150) | CoRL 2023 | Tests timing, coordination, and precision beyond grasping. | Simulated dexterous RL benchmark | Rich benchmark, but simulation-only. |
| 6 | [DexArt](https://arxiv.org/abs/2305.05706) | CVPR 2023 | Articulated-object dexterous manipulation benchmark. | RL with 3D representations | Good for generalization questions, but not a real-robot result. |
| 7 | [DexDeform](https://arxiv.org/abs/2304.03223) | 2023 | Uses demonstrations and differentiable physics for deformable dexterity. | Demo + differentiable physics | Valuable for non-rigid contact, but evaluation is specialized. |
| 8 | [DexCap](https://arxiv.org/abs/2403.07788) | 2024 | Portable human hand mocap plus DexIL for robot skills. | Human mocap, imitation, HIL correction | Important data-collection direction; embodiment gap remains. |
| 9 | [AnyRotate](https://arxiv.org/abs/2405.07391) | 2024 | Dense tactile sim-to-real for arbitrary-axis in-hand rotation. | Tactile RL, sim-to-real | Strong tactile evidence; task family is rotation. |
| 10 | [DextrAH-G](https://arxiv.org/abs/2407.02274) | CoRL 2024 | Fast, safe arm-hand grasping with geometric fabrics. | RL + geometric control + distillation | Good systems paper; more grasping than general in-hand manipulation. |
| 11 | [DexGraspNet 2.0](https://arxiv.org/abs/2410.23004) | CoRL 2024 | 427M grasps in cluttered synthetic scenes and 90.7% real success reported. | Synthetic dataset, diffusion grasping | Strong scale and sim-to-real result, but focused on grasp generation. |
| 12 | [HIL-SERL / Precise and Dexterous Robotic Manipulation via HIL RL](https://arxiv.org/abs/2410.21845) | 2024 | Shows practical real-world RL with human correction in 1-2.5h. | Human-in-loop RL, reward classifier | Strong for real tasks, but not mainly multi-finger hands. |
| 13 | [DexMimicGen](https://arxiv.org/abs/2410.24185) | ICRA 2025 | Generates 21K bimanual dexterous humanoid demos from 60 human demos. | Simulation data generation, IL, real2sim2real | Scales bimanual data, but generated data quality depends on simulator/task setup. |
| 14 | [DexterityGen / DexGen](https://arxiv.org/abs/2502.04307) | 2025 | Pretrains reusable dexterous motion primitives and uses human commands as prompts. | RL primitive pretraining + teleop prompting | Strong low-level controller idea, but still needs human coarse command. |
| 15 | [DexVLA](https://arxiv.org/abs/2502.05855) | CoRL 2025 | Cross-embodiment VLA with a 1B diffusion action expert, including dexterous hands. | VLA + diffusion action expert | Good foundation-policy direction; action representation is the core value. |
| 16 | [Sim-to-Real RL for Vision-Based Dexterous Manipulation on Humanoids](https://arxiv.org/abs/2502.20396) | CoRL 2025 | Practical recipe for vision-based bimanual humanoid dexterity. | Sim-to-real RL, real-to-sim tuning, distillation | Strong humanoid result, but task set is still limited. |
| 17 | [DexGraspVLA](https://arxiv.org/abs/2502.20900) | 2025 preprint, AAAI 2026 oral per project/GitHub listing | Hierarchical VLM planner plus diffusion low-level controller for general dexterous grasping. | VLA, diffusion policy, imitation | Reports 90+% success in unseen clutter; mostly grasping. |
| 18 | [DexGrasp Anything](https://arxiv.org/abs/2503.08257) | 2025 | Physics-aware diffusion for universal dexterous grasp pose generation. | Diffusion grasp generation, physical constraints | Strong dataset/method contribution, but not full manipulation policy. |
| 19 | [ManipTrans](https://arxiv.org/abs/2503.21860) | CVPR 2025 | Transfers human bimanual skills to dexterous hands via residual learning. | Human-to-robot transfer, residual learning | Creates DexManipNet; primarily simulation transfer with dataset value. |
| 20 | [DexWild](https://arxiv.org/abs/2505.07813) | RSS 2025 | In-the-wild human interaction data plus robot co-training. | Human data collection, co-training | Reports 68.5% success in unseen environments and better embodiment transfer; depends on grounding robot data. |
| 21 | [DexUMI](https://arxiv.org/abs/2505.21864) | CoRL 2025 best paper final list per project page | Human hand as universal interface with exoskeleton and robot-hand inpainting. | Human interface, robot-hand policy learning | Two real dexterous hardware platforms, 86% average success; hardware complexity matters. |
| 22 | [DexMachina](https://arxiv.org/abs/2505.24853) | ICML 2026 per project page | Functional retargeting from human demonstrations to bimanual robot hands. | Curriculum RL, object-state tracking | Useful for articulated objects and hardware comparison; primarily simulation benchmark. |
| 23 | [Dex1B](https://arxiv.org/abs/2506.17198) | RSS 2025 | One billion demonstrations for grasping and articulation. | Generative dataset, geometric constraints | Massive scale and real experiments; quality hinges on generator assumptions. |
| 24 | [Dexplore](https://arxiv.org/abs/2509.09671) | CoRL 2025 | Treats mocap trajectories as soft guidance and jointly retargets/tracks. | Reference-scoped exploration, RL, generative controller | Important answer to noisy human data; real deployment evidence is promising but should be checked per task. |
| 25 | [DexCanvas](https://arxiv.org/abs/2510.15786) | 2025 | 7,000h hybrid real-synthetic human manipulation with contact/force annotations. | Dataset, RL-based real-to-sim contact reconstruction | Directly targets contact annotations, but it is a dataset/modeling contribution. |
| 26 | [Shared Autonomy Arm-Hand VLA](https://arxiv.org/abs/2511.00139) | 2025 | Human controls arm macro motion while autonomous DexGrasp-VLA controls fingers. | Shared autonomy, tactile/visual hand policy, VLA | Practical data collection with reported 90% success; relies on prior hand policy. |
| 27 | [World Models for Learning Dexterous Hand-Object Interactions from Human Videos / DexWM](https://arxiv.org/abs/2512.13644) | 2025, v2 2026 | Direct dexterous world model trained from human and robot videos. | Latent world model, finger keypoint actions, MPC | Directly relevant to dexterous hands; reports >50% average improvement over Diffusion Policy on real Allegro gripper tasks. |
| 28 | [Scaling Cross-Embodiment World Models for Dexterous Manipulation](https://arxiv.org/abs/2511.01177) | 2025 | Uses particle representations to share world models across human and robot hands. | Graph world model, particle action space, MPC | Important representation idea; needs broader real-hardware validation. |
| 29 | [Dexterous World Models](https://arxiv.org/abs/2512.17907) | 2025 | Scene-action-conditioned video diffusion for hand-scene interaction in digital twins. | Video diffusion world model | Useful for interactive simulation, but less directly a robot controller. |
| 30 | [DexHiL](https://arxiv.org/abs/2603.09121) | 2026 | Human-in-loop post-training specifically for dexterous VLA models. | VLA post-training, intervention-aware sampling | Real-robot improvement reported; depends on intervention infrastructure. |
| 31 | [MoDE-VLA](https://arxiv.org/abs/2603.08122) | 2026 | RL-trained in-hand copilot plus mixture-of-dexterous-experts VLA with force/tactile residuals. | VLA, RL primitives, tactile/force fusion | Very relevant to contact-rich bimanual dexterity; recent preprint, needs independent replication. |
| 32 | [Dexora](https://arxiv.org/abs/2605.18722) | 2026 | Open-source VLA system for dual-arm dual-hand high-DoF manipulation. | VLA, hybrid teleop, diffusion transformer | Strong scale claim and open-data direction; very recent. |
| 33 | [Enhancing Policy Learning with WAM](https://arxiv.org/abs/2603.28955) | 2026 | Adds inverse dynamics to world models for more action-relevant representations. | WAM, DreamerV2, PPO | General manipulation, not dexterous hand-specific. |
| 34 | [GigaWorld-Policy](https://arxiv.org/abs/2603.17240) | 2026 | Action-centered WAM with optional video generation for faster deployment. | WAM, video-action model | General robot policy evidence, useful for latency lessons. |
| 35 | [MotuBrain](https://arxiv.org/abs/2604.27792) | 2026 | Unified WAM for policy, world modeling, inverse dynamics, and video-action prediction. | WAM, UniDiffuser, multiview, cross-embodiment | General WAM, strong RoboTwin claims; not hand-specific. |
| 36 | [AIM](https://arxiv.org/abs/2604.11135) | 2026 | Uses spatial value maps as the bridge from future video to action. | WAM, spatial value maps, self-distillation RL | Good idea for contact intent; currently general manipulation. |
| 37 | [STARRY](https://arxiv.org/abs/2604.26848) | 2026 | Jointly denoises future spatial-temporal latents and actions with geometry-aware attention. | WAM, spatial-temporal diffusion, geometry | General/bimanual manipulation; useful geometry interface. |
| 38 | [OA-WAM](https://arxiv.org/abs/2605.06481) | 2026 | Object-addressable slots for robust WAM under scene perturbation. | Object-centric WAM, flow matching | Strong object binding concept, but not dexterous-hand-specific. |
| 39 | [HarmoWAM](https://arxiv.org/abs/2605.10942) | 2026 | Adaptive gating between predictive and reactive WAM experts. | WAM, predictive/reactive control | Relevant control tradeoff, but evaluated as general manipulation. |

## Cross-Paper Synthesis

### What pure RL got right

RL remains the best tool for discovering non-human finger gaits, contact sequences, and corrective behaviors that are hard to demonstrate. DexGen and the humanoid sim-to-real work show that RL is especially valuable for low-level primitives and contact-rich refinement. However, pure RL is expensive, task-specific, and brittle under simulator error.

### What imitation and data scaling got right

DexCap, DexMimicGen, DexUMI, DexWild, Dexplore, ManipTrans, DexMachina, DexCanvas, and Dex1B all attack the data bottleneck from different sides. The pattern is clear: strict trajectory cloning is weak, while functional imitation is stronger. Good methods preserve object outcomes, contact roles, or feasible hand intent rather than exact human joint trajectories.

### What VLA got right

DexVLA and DexGraspVLA show that dexterity benefits from foundation-model semantics and scalable action experts. Shared autonomy, DexHiL, MoDE-VLA, and Dexora show the next step: VLA should not be a monolithic language-conditioned policy. It needs dexterous experts, tactile or force residuals, and correction data to reach reliable high-DoF control.

### What world models/WAM got right

DexWM is the most directly relevant dexterous-hand world model because it uses fine-grained dexterous action representations and human videos. Scaling Cross-Embodiment World Models suggests a second key idea: represent action and state in an embodiment-neutral space, such as particles or keypoints, so human hands and robot hands can share dynamics. The broader WAM papers are valuable because they expose the failure mode of naive video prediction: the predicted future must be action-decodable, not just visually plausible.

### The unresolved technical gaps

1. Contact-grounded prediction: Most world models predict pixels, latents, slots, or depth, but not contact force, slip, friction mode, or tactile signatures.
2. Embodiment transfer: Human videos and robot hands share object dynamics, but not kinematics, actuation, compliance, or tactile access.
3. Real resets and safety: Real-world RL/HIL needs resets, safe exploration envelopes, and fast interventions, which are still system-level burdens.
4. Long-horizon dexterity: Grasping has many successes; tool use, threading, cutting, peeling, fastening, and handover remain harder.
5. Evaluation quality: Many papers report high success on curated tasks. The field needs cross-lab protocols with unseen objects, perturbations, hardware faults, tactile ablations, and cycle-time metrics.

## Practical Research Takeaways

1. For a near-term project, do not train a large VLA from scratch. Start with a small action expert or diffusion/RL policy for a narrow hand skill, then add language or VLM planning only where semantic selection matters.
2. Use human data for coverage, but do not directly clone human joints. Convert demonstrations into object trajectories, contact goals, fingertip/keypoint targets, or particle displacements.
3. Use RL where it is strongest: low-level contact primitives, residual correction, recovery, and policy improvement after imitation.
4. Treat tactile/force as a first-class signal. Recent work repeatedly shows that vision alone is weak for in-hand operations.
5. If using world models, make the future representation actionable: object slots, contact maps, fingertip displacements, spatial value maps, or geometry-aware attention are more useful than generic video prediction.
