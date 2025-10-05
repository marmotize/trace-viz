# trace-viz

Trace visualization monorepo with automatic version detection and transformation.

## Architecture

### Processing Pipeline Overview

```mermaid
graph LR
    %% Layers
    subgraph Input["📥 INPUT LAYER"]
        Raw["Raw Trace Object<br/>{version, spans, metadata, ...}"]:::inputBox
    end
    
    subgraph Detection["🔍 DETECTION LAYER"]
        VD["Version Detector<br/>(JSONata Expression)"]:::detectionBox
        VDDetail["• Evaluates expression on trace<br/>• Returns version string<br/>• Falls back if needed"]:::detailBox
    end
    
    subgraph Registry["📚 REGISTRY LAYER"]
        VR["Visualizer Registry<br/>(Version → Component Map)"]:::registryBox
        VRDetail["• Exact match: version === '2'<br/>• Semantic match: '2.1.3' → '2.1' → '2'<br/>• Default fallback"]:::detailBox
    end
    
    subgraph Transform["⚙️ TRANSFORMATION LAYER"]
        TP["Trace Preparer<br/>(Optional)"]:::transformBox
        TPDetail["• Validates trace schema<br/>• Normalizes data structure<br/>• Enriches with metadata<br/>• Type-safe output"]:::detailBox
    end
    
    subgraph Output["📤 OUTPUT LAYER"]
        State["Orchestrator State"]:::outputBox
        StateDetail["• status: 'success' | 'error'<br/>• trace: PreparedTrace<br/>• version: string<br/>• visualizer: Component<br/>• error: Error | null"]:::detailBox
        Viz["Visualizer Component<br/>(React/Vue/Svelte)"]:::outputBox
    end
    
    %% Flow
    Raw --> VD
    VD -.->|"version string"| VDDetail
    VDDetail --> VR
    VR -.->|"component"| VRDetail
    VRDetail --> TP
    TP -.->|"prepared trace"| TPDetail
    TPDetail --> State
    State -.->|"contains"| StateDetail
    State --> Viz
    
    %% Styling
    classDef inputBox fill:#1a1a2e,stroke:#4a90e2,stroke-width:3px,color:#fff
    classDef detectionBox fill:#16213e,stroke:#e94560,stroke-width:3px,color:#fff
    classDef registryBox fill:#16213e,stroke:#9c27b0,stroke-width:3px,color:#fff
    classDef transformBox fill:#16213e,stroke:#ffa726,stroke-width:3px,color:#fff
    classDef outputBox fill:#1a1a2e,stroke:#66bb6a,stroke-width:3px,color:#fff
    classDef detailBox fill:#0f3460,stroke:#7986cb,stroke-width:1px,color:#ddd,font-size:11px
```

### Detailed Processing Flow

```mermaid
graph TB
    %% Input Stage
    RawTrace[("Raw Trace Data<br/>(JSON Object)")]:::inputNode
    
    %% Orchestrator
    Orchestrator["TraceOrchestrator<br/>process()"]:::orchestratorNode
    
    %% Main Processing Pipeline
    StateUpdate1["Update State<br/>status: 'processing'"]:::stateNode
    
    %% Version Detection Phase
    VersionDetection["Version Detection<br/>versionDetector.detect()"]:::phaseNode
    JSONata["JSONata Expression<br/>Evaluator"]:::detailNode
    VersionExtract["Extract version from<br/>trace using expression"]:::detailNode
    VersionFallback{"Has fallback?"}:::decisionNode
    VersionResult["Version String<br/>(e.g., '1', '2', '1.0')"]:::resultNode
    
    %% Registry Phase
    RegistryLookup["VisualizerRegistry<br/>get(version)"]:::phaseNode
    ExactMatch{"Exact version<br/>match?"}:::decisionNode
    SemanticMatch{"Semantic version<br/>match?<br/>(major.minor)"}:::decisionNode
    DefaultViz{"Has default<br/>visualizer?"}:::decisionNode
    VisualizerFound["Visualizer Component"]:::resultNode
    RegistryError["Error: No visualizer<br/>for version"]:::errorNode
    
    %% Transformation Phase
    HasPreparer{"Has preparer<br/>configured?"}:::decisionNode
    PreparerTransform["TracePreparer<br/>prepare()"]:::phaseNode
    TransformDetail["Transform raw trace<br/>to visualization format"]:::detailNode
    PreparedTrace["Prepared Trace<br/>(typed, validated)"]:::resultNode
    DirectTrace["Use raw trace<br/>directly"]:::detailNode
    
    %% Concurrency Check
    ConcurrencyCheck{"Operation still<br/>current?"}:::decisionNode
    Abandoned["Abandon<br/>operation"]:::errorNode
    
    %% Success State
    StateUpdateSuccess["Update State<br/>status: 'success'<br/>+ trace + version + visualizer"]:::successNode
    
    %% Error Handling
    ErrorCatch["Catch Error"]:::errorNode
    StateUpdateError["Update State<br/>status: 'error'<br/>+ error object"]:::errorNode
    
    %% Output
    Subscribers["Notify Subscribers<br/>via callbacks"]:::outputNode
    FinalState["OrchestratorState<br/>{status, trace, version,<br/>visualizer, error}"]:::outputNode
    
    %% Registry Setup (Side)
    RegisterViz["registerVisualizer()<br/>registerVisualizers()"]:::setupNode
    SetDefault["setDefaultVisualizer()"]:::setupNode
    RegistryStore[("VisualizerRegistry<br/>Map<Version, Component>")]:::storageNode
    
    %% Flow
    RawTrace --> Orchestrator
    Orchestrator --> StateUpdate1
    StateUpdate1 --> VersionDetection
    
    %% Version Detection Detail
    VersionDetection --> JSONata
    JSONata --> VersionExtract
    VersionExtract --> VersionFallback
    VersionFallback -->|No| VersionResult
    VersionFallback -->|Error| VersionResult
    VersionFallback -->|Yes| VersionResult
    
    %% Registry Lookup Flow
    VersionResult --> RegistryLookup
    RegistryLookup --> ExactMatch
    ExactMatch -->|Yes| VisualizerFound
    ExactMatch -->|No| SemanticMatch
    SemanticMatch -->|Yes<br/>major.minor or major| VisualizerFound
    SemanticMatch -->|No| DefaultViz
    DefaultViz -->|Yes| VisualizerFound
    DefaultViz -->|No| RegistryError
    RegistryError --> ErrorCatch
    
    %% Transformation Flow
    VisualizerFound --> HasPreparer
    HasPreparer -->|Yes| PreparerTransform
    HasPreparer -->|No| DirectTrace
    PreparerTransform --> TransformDetail
    TransformDetail --> PreparedTrace
    
    %% Merge paths
    PreparedTrace --> ConcurrencyCheck
    DirectTrace --> ConcurrencyCheck
    
    %% Concurrency
    ConcurrencyCheck -->|No| Abandoned
    ConcurrencyCheck -->|Yes| StateUpdateSuccess
    
    %% Success path
    StateUpdateSuccess --> Subscribers
    Subscribers --> FinalState
    
    %% Error path
    ErrorCatch --> StateUpdateError
    StateUpdateError --> Subscribers
    
    %% Registry setup (separate flow)
    RegisterViz -.->|"register(version, component)"| RegistryStore
    SetDefault -.->|"setDefault(component)"| RegistryStore
    RegistryStore -.->|used by| RegistryLookup
    
    %% Styling
    classDef inputNode fill:#1a1a2e,stroke:#4a90e2,stroke-width:3px,color:#fff
    classDef orchestratorNode fill:#0f3460,stroke:#4a90e2,stroke-width:3px,color:#fff
    classDef phaseNode fill:#16213e,stroke:#e94560,stroke-width:2px,color:#fff
    classDef stateNode fill:#1a1a2e,stroke:#ffa726,stroke-width:2px,color:#fff
    classDef decisionNode fill:#0f3460,stroke:#f39c12,stroke-width:2px,color:#fff
    classDef resultNode fill:#1a1a2e,stroke:#66bb6a,stroke-width:2px,color:#fff
    classDef detailNode fill:#16213e,stroke:#7986cb,stroke-width:1px,color:#fff
    classDef errorNode fill:#1a1a2e,stroke:#e94560,stroke-width:2px,color:#fff
    classDef successNode fill:#1a1a2e,stroke:#66bb6a,stroke-width:3px,color:#fff
    classDef outputNode fill:#0f3460,stroke:#4a90e2,stroke-width:3px,color:#fff
    classDef setupNode fill:#16213e,stroke:#9c27b0,stroke-width:2px,color:#fff
    classDef storageNode fill:#1a1a2e,stroke:#9c27b0,stroke-width:2px,color:#fff
```

### End-to-End Sequence

```mermaid
sequenceDiagram
    participant App as React App
    participant Hook as useTraceViz Hook
    participant Orch as TraceOrchestrator
    participant VD as VersionDetector
    participant Reg as VisualizerRegistry
    participant Prep as TracePreparer
    participant Viz as Visualizer Component
    
    Note over App,Viz: SETUP PHASE
    App->>Hook: Initialize with config
    Hook->>Orch: new TraceOrchestrator(config)
    App->>Hook: registerVisualizers({v1, v2})
    Hook->>Orch: registerVisualizers()
    Orch->>Reg: register('1', V1Component)
    Orch->>Reg: register('2', V2Component)
    Hook->>Orch: subscribe(callback)
    Orch-->>Hook: unsubscribe function
    
    Note over App,Viz: PROCESSING PHASE
    App->>Hook: process(rawTrace)
    Hook->>Orch: process(rawTrace)
    
    rect rgb(26, 26, 46)
        Note over Orch: State: 'processing'
        Orch->>VD: detect(rawTrace)
        VD->>VD: Evaluate JSONata expression
        VD-->>Orch: version = "2"
    end
    
    rect rgb(22, 33, 62)
        Note over Orch: Version Detected
        Orch->>Reg: get("2")
        Reg->>Reg: Exact match lookup
        Reg-->>Orch: V2Component
    end
    
    rect rgb(15, 52, 96)
        Note over Orch: Visualizer Found
        Orch->>Prep: prepare(rawTrace, {version, visualizer})
        Prep->>Prep: Validate with Zod schema
        Prep->>Prep: Transform structure
        Prep-->>Orch: preparedTrace (typed)
    end
    
    rect rgb(26, 26, 46)
        Note over Orch: State: 'success'
        Orch->>Orch: updateState({trace, version, visualizer})
        Orch->>Hook: notify subscriber
        Hook->>Hook: Update React state
        Hook-->>App: {status, trace, visualizer, version}
    end
    
    Note over App,Viz: RENDER PHASE
    App->>Viz: render <Visualizer trace={trace} />
    Viz-->>App: Rendered visualization
    
    Note over App,Viz: ERROR SCENARIO
    App->>Hook: process(invalidTrace)
    Hook->>Orch: process(invalidTrace)
    VD->>VD: Expression fails
    VD-->>Orch: throws Error
    Orch->>Orch: updateState({status: 'error', error})
    Orch->>Hook: notify subscriber
    Hook-->>App: {status: 'error', error: Error}
```

## Packages

- **[@trace-viz/core](packages/core)**: Core orchestration library for trace visualization
- **[@trace-viz/react](packages/react)**: React hooks and components for trace visualization

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Watch mode for all packages
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint
pnpm lint

# Typecheck
pnpm typecheck

# Format
pnpm format
```

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

1. Create a changeset: `pnpm changeset`
2. Commit the changeset
3. Open a PR
4. On merge to main, a "Version Packages" PR will be created
5. Merge the version PR to publish to npm

## Contributing

- Use [conventional commits](https://www.conventionalcommits.org/)
- Run `pnpm test` before committing
- Ensure all checks pass before merging

## License

MIT