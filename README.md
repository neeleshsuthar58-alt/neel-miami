# NEEL – MIAMI UNDERWORLD (Mobile Prototype)

This is the first playable mobile 3D prototype, packaged as a web app/PWA source project. It is not yet an APK and is not a complete open-world game.

## Included
- 3D Miami-inspired blockout city, road grid, beach and water
- Third-person character named Neel
- Touch joystick movement
- Jump button
- Jason follower character with a simple proximity dialogue
- A basic drivable red car: approach it and press ACTION to enter; press ACTION again to exit
- Camera toggle
- Landscape mobile layout

## Run
The project uses Three.js as an ES module from jsDelivr, so run it from a web server (not by opening `index.html` as a local file).
For phone testing, upload these files to a static host such as GitHub Pages, then open the site in Chrome.

## Controls
- Left joystick: move / steer
- JUMP: jump
- ACTION: talk to Jason, enter or exit the car
- CAM: change camera distance

## Android APK
This folder is the game source, not an APK. To install as an APK, host the PWA over HTTPS and use a PWA-to-Android packaging service such as PWABuilder, following its current Android packaging instructions. A signed APK requires Android packaging/signing setup. Do not install APKs from unknown sources.

## Limitations of this milestone
The city is procedural blockout geometry, characters are placeholder shapes, and Jason's AI is basic following. No voice acting, missions, police, traffic, economy, save system, real Miami assets or advanced vehicle physics yet.
