# Component specs

One file per component, written **before** the code. Keep each to about a page. `/new-component {Name}` reads the spec, builds the component, and adds the E2E assertions listed under **Verify**.

Status per spec: `draft` → `reviewed` (human approved) → `built` (component exists and verify passed). `/new-component` refuses to build a `draft` spec.
