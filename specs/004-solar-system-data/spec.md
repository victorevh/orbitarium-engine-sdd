# Feature Specification: Full Solar System Dataset

**Feature Branch**: `004-solar-system-data`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "The system must include a full solar system dataset with all major planets and at least one moon (Earth's Moon), using real astronomical parameters."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Load and Visualize Complete Solar System (Priority: P1)

A user or developer loads a pre-configured JSON scene file that defines the complete solar system: the Sun, all 8 major planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), and Earth's Moon with real astronomical parameters. The simulation renders the system with each body in its correct orbital position and the visualization accurately reflects the relative scales and positions of the solar system.

**Why this priority**: This is the core deliverable and the fundamental value of the feature. Without this, the solar system dataset has no practical use. It demonstrates that the system can handle realistic, complete astronomical data.

**Independent Test**: Load the default solar-system scene configuration file. Verify that exactly 9 planetary bodies plus Earth's Moon (10 bodies total) are present in the scene. Confirm that each body can be queried for its orbital elements and that they match the NASA/JPL reference values within acceptable tolerances (±1% for semi-major axis).

**Acceptance Scenarios**:

1. **Given** the engine loads a scene configuration for the complete solar system with real planetary data,
   **When** the scene initialization completes,
   **Then** all 8 planets and Earth's Moon are created as distinct bodies with their correct orbital parameters loaded.

2. **Given** the simulation is running with the complete solar system,
   **When** 1 simulated year has elapsed at a 1 s = 1 day time scale,
   **Then** Earth has completed 1 full orbit (±2%), Mercury has completed approximately 4 orbits, and Neptune has completed approximately 0.01 orbits.

3. **Given** Earth's Moon is included in the scene configuration,
   **When** the simulation advances,
   **Then** the Moon orbits Earth (not the Sun) at the correct sidereal period (~27.3 days) and does not exhibit orbital instability over 1 simulated year.

---

### User Story 2 — Real Astronomical Parameters from Authoritative Sources (Priority: P1)

A developer reviews the solar system configuration and can trace each orbital parameter (semi-major axis, eccentricity, inclination, etc.) to a specific authoritative source (NASA/JPL Horizons System or equivalent). The parameters are accurate and current, suitable for educational and demonstration purposes.

**Why this priority**: Credibility and accuracy of the data directly impacts the value and educational utility of the system. Without verifiable real data, this is just a generic orbital simulator.

**Independent Test**: Cross-reference each planetary body's parameters in the configuration file with published NASA/JPL data. For each planet, verify that semi-major axis, eccentricity, and inclination match the reference values within ±1%.

**Acceptance Scenarios**:

1. **Given** the solar system configuration file,
   **When** each planetary body's orbital parameters are extracted,
   **Then** the parameters match NASA/JPL Horizons System reference data (epoch J2000.0 or current epoch) within ±1% for distance and ±1° for angles.

2. **Given** the configuration includes metadata or comments documenting data sources,
   **When** a developer reviews the file,
   **Then** the developer can identify which reference was used for each body's parameters (e.g., "Mercury semi-major axis: 0.387 AU per NASA Horizons 2026.0").

3. **Given** new astronomical data becomes available or standards change,
   **When** the configuration is updated,
   **Then** all bodies reflect the new reference values and the change is documented with the updated source and epoch.

---

### User Story 3 — Configuration-Driven Scene with No Code Changes (Priority: P2)

A content creator or developer can create a new scene that uses the complete solar system dataset by simply referencing a pre-built JSON configuration file. No TypeScript or JavaScript code modifications are required; the scene is fully defined and testable through configuration alone.

**Why this priority**: Practical usability and extensibility. Developers must be able to use the solar system without compiling or modifying source code. This decouples data management from implementation.

**Independent Test**: Create a new test or demo that loads the solar system configuration from a JSON file without any scene-building code. Verify that the simulation runs correctly and all bodies render.

**Acceptance Scenarios**:

1. **Given** a JSON scene configuration file that defines the complete solar system,
   **When** the engine loads this file via `EngineHandle.loadScene(configJson)`,
   **Then** the simulation is fully initialized and ready to run; no additional scene-building code is required.

2. **Given** the solar system configuration is stored in a separate file (e.g., `solar-system.json`),
   **When** a demo application references this file,
   **Then** the application can be updated to use a different configuration (e.g., geocentric vs. heliocentric) by changing only the file reference.

3. **Given** a developer wants to create a custom scene derived from the solar system dataset,
   **When** they copy and modify the solar system JSON configuration,
   **Then** the modified configuration loads and runs without errors; validation catches any parameter violations.

---

### User Story 4 — Accurate Scale and Proportions in Visualization (Priority: P2)

A user or developer observes the rendered solar system and notes that relative orbital sizes, distances, and body scales are visually proportional and accurate within the constraints of the visualization technology (screen resolution, zoom range). The outer planets are visibly farther than inner planets, and body sizes reflect realistic ratios (the Sun dominates, Jupiter is large, inner planets are small).

**Why this priority**: Visual accuracy builds confidence in the simulation and educational value. Users can trust that what they see reflects reality, even if absolute scale is compressed for visualization.

**Independent Test**: Render the solar system at a fixed zoom level. Measure the visual distances between consecutive planet orbits and the sizes of rendered bodies. Compare against expected relative ratios (e.g., Mercury to Venus distance ratio, Jupiter to Saturn size ratio). Verify that ratios are within acceptable visual tolerance (±20% due to rendering constraints).

**Acceptance Scenarios**:

1. **Given** the solar system is rendered at a default camera zoom level,
   **When** the viewport displays all 8 planets and the Sun,
   **Then** the visual distance ratios between orbits match the actual distance ratios within ±20% (accounting for rendering scale factors).

2. **Given** a user zooms to focus on the inner planets (Mercury, Venus, Earth, Mars),
   **When** the outer planets (Jupiter, Saturn, Uranus, Neptune) exit the viewport,
   **Then** the inner planet spacing and body sizes are visually accurate relative to each other.

3. **Given** a user zooms to focus on Earth and its Moon,
   **When** both bodies are rendered,
   **Then** the Moon is visibly smaller than Earth and orbits at the correct visual distance and speed.

---

### Edge Cases

- What happens when the simulation is paused or time scale is set to zero? All 10 bodies should remain in their current orbital positions without movement or rotation.
- What happens when a body reaches perihelion or aphelion? Orbital velocity and position must be computed correctly without discontinuities (Mercury reaches perihelion ~4 times per simulated year).
- What happens when the Moon crosses through Earth's terminator (shadow) during an eclipse? Rendering must handle this gracefully; simulation continues without error.
- What happens if the time scale is extremely large (e.g., 1 s = 1000 years)? All bodies must continue orbiting stably without accumulated drift or numerical errors over extended runtime.
- What happens when a user loads a solar system configuration with an invalid parameter (e.g., Neptune with eccentricity ≥ 1)? Validation must reject the configuration with a clear error message before any rendering occurs.
- What happens when the visualization zoom range cannot accommodate the full solar system (outer planets are 30+ AU away)? The system must compute appropriate zoom limits to display the solar system at a readable scale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST include configuration data for all 8 major planets of the solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.

- **FR-002**: The system MUST include configuration data for Earth's Moon as a distinct celestial body that orbits Earth, not the Sun. Additional predefined moon configurations (Mars Phobos/Deimos, Jupiter's Galilean moons: Io/Europa/Ganymede/Callisto, Saturn's Titan/Iapetus) SHOULD be provided as optional JSON fixtures.

- **FR-003**: Each planetary body MUST be configured with real astronomical Keplerian orbital elements: semi-major axis (AU), eccentricity, inclination (degrees), argument of periapsis (degrees), longitude of ascending node (degrees), and mean anomaly at epoch (degrees), sourced from NASA/JPL Horizons System or equivalent authoritative reference.

- **FR-004**: The Sun MUST be included as a central body (type: "star") with appropriate size and lighting properties.

- **FR-005**: Each planetary body MUST include axial rotation parameters: sidereal rotation period (Earth days) and axial tilt (degrees), sourced from NASA/JPL data.

- **FR-006**: Earth's Moon MUST have orbital parameters configured such that it orbits Earth (not the Sun) with a sidereal period of approximately 27.3 days.

- **FR-007**: The solar system configuration MUST be defined in JSON format conforming to the existing SceneConfiguration schema (using the "keplerian" orbit model).

- **FR-008**: All orbital parameters and rotational properties MUST be validated against the SceneConfiguration schema upon load; invalid configurations MUST be rejected before scene initialization.

- **FR-009**: The configuration MUST include metadata documenting the data source (e.g., NASA Horizons epoch, date of last update) for traceability and accuracy verification.

- **FR-010**: The system MUST support both a complete 10-body solar system configuration and optional variations (e.g., 8 planets without Moon) through configuration.

- **FR-011**: Each body's size property MUST be proportional to real planetary radii, though the absolute scale may be adjusted for visualization purposes; the system MUST document the scale factor applied.

### Key Entities

- **Sun**: Central star body with mass, radius, luminosity (implicit through lighting), and rotation parameters. Acts as the reference point for all planetary orbits.

- **Planet**: Celestial body orbiting the Sun with:
  - Keplerian orbital elements defining its elliptical path
  - Physical properties: radius, mass (optional for simulation)
  - Axial rotation: sidereal period and tilt angle
  - Body type identifier (planet)

- **Moon (Earth's Moon)**: Special case of a celestial body orbiting a planet (not the Sun), with:
  - Keplerian orbital elements relative to its parent (Earth)
  - Physical properties: radius, mass
  - Axial rotation: sidereal period and tilt angle
  - Reference to its parent body (Earth)

- **OrbitalElements**: Data structure containing all Keplerian orbital parameters for a single body:
  - semiMajorAxisAU (AU)
  - eccentricity (unitless, 0 ≤ e < 1)
  - inclinationDeg (degrees)
  - longitudeAscendingNodeDeg (degrees)
  - argumentPeriapsisDeg (degrees)
  - meanAnomalyEpochDeg (degrees)

- **RotationalProperties**: Data structure containing physical rotation parameters:
  - siderealPeriodDays (days)
  - axialTiltDeg (degrees, 0–180)
  - initialPhaseOffsetDeg (degrees, optional)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The solar system configuration file loads without errors and initializes a scene containing exactly 10 bodies (8 planets + Sun + Moon).

- **SC-002**: Each planetary body's orbital parameters match NASA/JPL Horizons reference data within ±1% for semi-major axis and within ±1° for inclination and other angles.

- **SC-003**: After 1 simulated year (365 simulated days at 1 s = 1 day time scale), Earth completes 1 full orbit (±2%), Mercury completes ~4.15 orbits (±5%), and Neptune completes ~0.01 orbits (±10%).

- **SC-004**: Earth's Moon completes approximately 13.4 orbits around Earth during 1 simulated year (sidereal period ~27.3 days), with no orbital instability or drift.

- **SC-005**: The system can render all 10 bodies simultaneously without visual artifacts, with relative distances and sizes visually proportional to reality (within ±20% due to rendering scale factors).

- **SC-006**: Scene validation rejects any configuration with invalid orbital parameters (e.g., eccentricity ≥ 1, negative semi-major axis) and provides a clear error message indicating the specific violation.

- **SC-007**: The configuration file includes documentation or metadata that traces each body's parameters to an authoritative source (NASA/JPL, publication date, epoch).

- **SC-008**: A new scene can be created and loaded using only the solar system JSON configuration file, with no TypeScript code modifications required.

## Clarifications

### Session 2026-04-30

- **Q1: Epoch reference for orbital parameters?** → **A: Configurable (support both J2000.0 and current epoch)**
  - Rationale: Flexibility allows use as educational snapshot (J2000.0) or as live reference (current epoch)
  - Decision: Configuration file includes `sourceMetadata.epoch` field that can be "J2000.0" or "Current (2026)" or similar
  - Implication: Orbital element values are explicitly tied to their epoch; when updating to new epoch, full recalculation needed
  - Default: J2000.0 for initial release (stable reference), with guidance for future updates

- **Q2: Moon support scope?** → **A: Earth's Moon in core + predefined fixtures for other planetary moons**
  - Rationale: Earth's Moon is core deliverable; other moons (Mars Phobos/Deimos, Jupiter Galilean moons, Saturn Titan/Iapetus) shipped as optional configuration files
  - Decision: Implement full moon parent-body support (any centerBodyId) in simulation layer; include predefined JSON fixtures for Mars, Jupiter, Saturn major moons
  - Implication: Users can enable/disable moons via configuration; extensible for future additions without code changes
  - Scope: Core delivery includes solar-system-complete.json with Earth's Moon; supplementary fixtures in separate directory for user selection

- **Q3: Body type schema & hierarchy?** → **A: New "moon" body type in schema**
  - Rationale: Explicit "moon" type provides cleaner semantics, better validation error messages, and clear rendering intent
  - Decision: Add "moon" as a distinct type enum value in Zod schema (alongside "planet", "star"). Validation rule: if `type: "moon"`, then `centerBodyId` must exist and reference a planet (not "sun")
  - Implication: Schema is simpler than hierarchical alternatives; validation error messages are specific (e.g., "body type must be 'moon' to have centerBodyId"); rendering can check type directly
  - Default rendering: Moon bodies rendered with distinct material/color (grey) distinct from planets

## Assumptions

- **Data Source**: Orbital and rotational parameters are sourced from NASA/JPL Horizons System (heliocentric). The configuration specifies the epoch (e.g., J2000.0, or current date) in `sourceMetadata.epoch`. This feature ships with J2000.0 as the default stable reference; future updates may adopt current-epoch data when consensus warrants.

- **Scale Representation**: The Moon is represented as a distinct body in the same coordinate system as planets. The visualization may apply scale compression for practical rendering, but this is transparent to the simulation layer.

- **Coordinate System**: The solar system uses the same right-handed coordinate system as the existing engine (heliocentric, with the Sun at the origin initially, though bodies can be offset for visualization).

- **Time Epoch**: All mean anomaly values are specified for the epoch documented in `sourceMetadata.epoch` (default: J2000.0). The simulation begins at this epoch unless explicitly overridden by configuration or user input.

- **No Perturbations**: The initial implementation uses simple Keplerian mechanics without perturbations from other bodies. Moon-Earth interactions are modeled as two-body Keplerian dynamics, not full gravitational interactions. This is acceptable for the scope of this feature but should be documented.

- **Rotation Phase**: Each body's initial rotation phase is either specified in the configuration or defaults to 0° (a documented default reference orientation).

- **Lighting**: The Sun is the only light source. Planetary bodies receive light from the Sun; shadows and eclipses are rendered based on simple geometry (body position and size), not full physics.

- **Educational Use**: This feature is intended for educational and demonstration purposes. While real data is used, absolute numerical precision is less critical than visual accuracy and ease of understanding.
