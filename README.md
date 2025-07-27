# Defibrillator Simulator - Online Training Platform


## 🏥 Project Context

This app was developed during a 2-month internship in the Emergency Department at Saint-Louis Hospital (Paris). The project was technically overseen by Marc Dinh (Engineering School Professor) ans under the medical supervision of Dr. Sami Ellouze (Emergency Physician). The goal was creating an accessible online training platform for defibrillation techniques.

## 🎯 Project Overview

### Version 1 (Current) - Public Training Platform
The current version offers **free access** to realistic defibrillator simulation scenarios, designed for:
- **Medical students**
- **Healthcare professionals** 
- **General public**
- **Emergency response teams**

Users can practice essential defibrillation skills through authentic hospital scenarios in a safe, controlled environment available 24/7.

### Version 2 (In Development) - Professional Training Suite
The upcoming version will feature:
- **Real-time connectivity** with physical training mannequins
- **Advanced vital signs monitoring**
- **Targeted training** for hospital staff to enhance emergency response efficiency

## ✨ Key Features

### 🔄 Multiple Operating Modes
- **AED Mode (DAE)** - Automated External Defibrillator with voice guidance
- **Manual Mode** - Professional manual defibrillation
- **Monitor Mode** - ECG rhythm monitoring and analysis
- **Stimulator Mode** - Cardiac pacing 

### 📊 Realistic Medical Scenarios
- **Ventricular Fibrillation** - Emergency defibrillation with manual defibrillator
- **AED Training** - Automated external defibrillator operation
- **Cardiac Pacing** - Emergency pacing for heart blocks
- **Cardioversion** - Synchronized cardioversion for arrhythmias

### 🫀 Authentic ECG Rhythms
- Real-time ECG display with authentic cardiac rhythms
- Multiple rhythm types: Sinus rhythm, VF, VT, Asystole
- Dynamic rhythm changes during scenarios
- Professional-grade waveform rendering

### 🎮 Interactive Interface
- Realistic defibrillator control panel
- Rotary knobs for energy selection
- LED indicators and status displays
- Audio feedback and voice instructions
- Electrode placement validation

## 🛠️ Technologies Used

- **Frontend Framework**: Next.js 15.3.3 with React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Animations**: GSAP 3.13.0
- **3D Graphics**: OGL 1.0.6
- **UI Components**: Lucide React icons
- **Notifications**: SweetAlert2
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Mariussgal/Defib_simulation.git
cd Defib_simulation
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000` to access the simulator

### Production Build
```bash
npm run build
npm start
```

## 📋 Available Scenarios

### Scenario 1: Ventricular Fibrillation
**Objectives**: 
- Connect electrodes and verify proper chest placement
- Switch defibrillator to monitor mode
- Analyze VF rhythm and stop CPR for analysis
- Set energy level to 150 joules
- Charge and deliver shock

### Scenario 2: AED Training  
**Objectives**:
- Power on defibrillator in AED mode
- Follow audio instructions
- Connect electrodes with proper placement
- Allow rhythm analysis
- Deliver recommended shock

### Scenario 3: Cardiac Pacing
**Objectives**:
- Connect monitoring electrodes
- Identify heart block rhythm
- Configure pacing parameters
- Initiate emergency pacing

### Scenario 4: Cardioversion
**Objectives**:
- Monitor atrial fibrillation
- Enable synchronization mode
- Set appropriate energy level
- Perform synchronized cardioversion

## 🎓 Educational Objectives

This simulator helps users develop critical skills:
- **ECG rhythm recognition** and interpretation
- **Proper electrode placement** techniques
- **Equipment operation** proficiency
- **Emergency decision-making** under pressure
- **Protocol adherence** in cardiac emergencies
- **Team coordination** during resuscitation

## 🌐 Live Demo

Visit the live application: [Defibrillator Simulator](https://defib-simulation.vercel.app/)

## 🤝 Contributing

We welcome contributions from the medical and development communities:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-scenario`)
3. Commit your changes (`git commit -m 'Add new training scenario'`)
4. Push to the branch (`git push origin feature/new-scenario`)
5. Open a Pull Request


## 🙏 Acknowledgments

- **Dr. Sami Ellouze** - Emergency Physician and Internship Supervisor at Saint-Louis Hospital
- **Marc Dinh** - Engineering School Professor/ML, DeepLearning engineer and Technical Supervisor
- **Saint-Louis Hospital Emergency Department**

---

**⚠️ Disclaimer**: This simulator is for educational purposes only. It does not replace proper medical training or certification. Always follow your institution's protocols and guidelines for actual emergency situations.
