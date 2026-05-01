# Feature: Navigation UX Improvements

## Goal

Provide intuitive, responsive, and perceptible navigation controls for exploring the simulation in both free and orbital modes.

---

## Requirements

### Free Navigation Mode

* The system must allow movement using:

  * W / S → forward / backward (relative to camera)
  * A / D → strafe left / right
  * Q / E → move down / up
* Movement must be relative to camera orientation (not global axes)
* Mouse movement must control camera rotation (yaw and pitch)
* Navigation must feel smooth and responsive

---

### Orbital Mode

* The camera must orbit around a selected target body
* The camera must always face the target body
* The user must be able to:

  * rotate around the target
  * zoom in/out
* Switching between free and orbital modes must be seamless

---

### Spatial Awareness

* The system must provide visual references to help orientation:

  * starfield or background space
  * optional debug helpers (axes/grid)
* The user must be able to perceive movement direction and depth

---

### Input Integration

* Keyboard input must be captured and routed to the navigation system
* Mouse movement must be captured using pointer lock
* Inputs must only affect navigation when appropriate (e.g., free mode)

---

## Constraints

* Must not break existing engine architecture
* Must use NavigationController as the single source of truth
* Must keep input handling isolated to the demo/UI layer
* Must not mix rendering logic with navigation logic

---

## Non-Goals

* No gamification mechanics
* No UI overlays or HUD systems
* No physics-based collisions
