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

import {
  Clock,
  Mesh,
  Object3D,
  PlaneBufferGeometry,
  RawShaderMaterial,
  WebGLRenderer,
} from 'three'
import debugVertexShader from '@/lib/graphics/shaders/raw/gpu-debug/vs-debug.glsl'
import debugFragmentShader from '@/lib/graphics/shaders/raw/gpu-debug/fs-debug.glsl'

class GPUSimulation extends Object3D {
  private debugMesh?: Mesh<PlaneBufferGeometry, RawShaderMaterial>

  constructor(
    private renderer: WebGLRenderer,
    private particleCount: number,
    private clock: Clock
  ) {
    super()
    this.setup()
    this.debugSetup()
  }

  private setup(): void {
    console.log('Hi world')
  }

  private debugSetup() {
    const geo: PlaneBufferGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
    const mat: RawShaderMaterial = new RawShaderMaterial({
      vertexShader: debugVertexShader,
      fragmentShader: debugFragmentShader,
    })

    this.debugMesh = new Mesh(geo, mat)
    this.add(this.debugMesh)
  }
}

export default GPUSimulation
