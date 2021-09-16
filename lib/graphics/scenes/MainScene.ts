/**
 * Copyright 2021 Felix Martinez
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"),to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import ThreeBase from '../core/ThreeBase'
import GPURendering from '../gpu/sim/GPURendering'
import GPUSimulation from '../gpu/sim/GPUSimulation'

class MainScene extends ThreeBase {
  private rafHandler: any
  private raf?: number
  private controls?: OrbitControls
  private debug: boolean = true
  private gpuSimulation?: GPUSimulation
  private gpuRendering?: GPURendering

  constructor(width: number, height: number, container: Element) {
    super(width, height, container)
    this.rafHandler = this.update.bind(this)
    this.setup()
    this.setupControls()
    this.setupGui()
    this.update()
  }

  private update(): void {
    this.raf = requestAnimationFrame(this.rafHandler)
    this.controls?.update()
    this.gpuSimulation?.update()
    this.gpuRendering?.update()
    this.render()
  }

  private setup(): void {
    this.renderer.setClearColor(0x343434)
    this.gpuSimulation = new GPUSimulation(5000, this.renderer, this.clock)
    this.gpuRendering = new GPURendering(this.gpuSimulation)
    this.scene.add(this.gpuSimulation)
    this.scene.add(this.gpuRendering)
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.dampingFactor = 0.09
    this.controls.enableDamping = true
    this.controls.screenSpacePanning = false
    this.controls.minDistance = 100
    this.controls.maxDistance = 300
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.rotateSpeed = 0.5
    this.controls.target.y = 0
  }

  private setupGui() {
    const pane = new Pane({ expanded: true })
    pane.element.parentElement!.style.display = 'contents'

    pane.addInput(this.gpuSimulation!, 'alignFactor', {
      min: 0,
      max: 3,
      step: 0.001,
    })
    pane.addInput(this.gpuSimulation!, 'cohesionFactor', {
      min: 0,
      max: 3,
      step: 0.001,
    })
    pane.addInput(this.gpuSimulation!, 'separationFactor', {
      min: 1,
      max: 10,
      step: 0.001,
    })
    pane.addInput(this.gpuSimulation!, 'forceToCenterFactor', {
      min: 0,
      max: 10.0,
      step: 0.00001,
    })
    pane.addInput(this.gpuSimulation!, 'maxSpeed', {
      min: 0,
      max: 400,
      step: 0.001,
    })
    pane.addInput(this.gpuSimulation!, 'maxForce', {
      min: 0,
      max: 40,
      step: 0.001,
    })
    pane.addInput(this.gpuSimulation!, 'range', {
      min: 0,
      max: 20,
      step: 0.001,
    })
  }
}

export default MainScene
