# fluid-musings

This is a collection of (at least one) fluid algorithm examples developed with the following goals...
* html5
* mostly self contained (minimal dependencies)
* functional programming style (mostly)

It has been open sourced in the hope that it might be useful to others.  Please log an issue or PR if you see implementation errors!

## Particle-based Viscoelastic Fluid Simulation

This is a simple to implement SPH technique that uses a Verlet style integrator to improve stability.  You can improve stability further by introducing a varying time step.  It also incorporates spatial hashing for fast searching for neighbouring particles within a radius.
Tools based on this technique were used in [this sequence from Legend of the Guardians: The Owls of Ga'Hoole](https://youtu.be/0c5gYg3adeI?t=100).

* [Paper](http://www.ligum.umontreal.ca/Clavet-2005-PVFS/pvfs.pdf)
* [Live Demo](http://chris-cooper.github.io/fluid-musings/viscoelastic.html)
