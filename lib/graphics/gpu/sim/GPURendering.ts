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
  InstancedBufferAttribute,
  BufferGeometry,
  InstancedMesh,
  Object3D,
  RawShaderMaterial,
  SphereBufferGeometry,
} from 'three'

import renderingVertex from '@/lib/graphics/shaders/raw/gpu-rendering/vs-rendering.glsl'
import renderingFragment from '@/lib/graphics/shaders/raw/gpu-rendering/fs-rendering.glsl'

import GPUSimulation from './GPUSimulation'

class GPURendering extends Object3D {
  private mesh?: InstancedMesh<BufferGeometry, RawShaderMaterial>

  constructor(private gpuSimulation: GPUSimulation) {
    super()
    this.setup()
  }

  public update() {
    this.mesh!.material.uniforms.uPositionsTexture.value = this.gpuSimulation.currentPositionRendertarget!.texture
  }

  private setup(): void {
    const geo: SphereBufferGeometry = new SphereBufferGeometry(1, 10, 10)
    const mat: RawShaderMaterial = new RawShaderMaterial({
      vertexShader: renderingVertex,
      fragmentShader: renderingFragment,
      uniforms: {
        uPositionsTexture: {
          value: this.gpuSimulation.currentPositionRendertarget!.texture,
        },
      },
    })

    const i2uvBuffer: InstancedBufferAttribute = new InstancedBufferAttribute(
      new Float32Array(this.gpuSimulation.particleCount * 2),
      2
    )

    const td = this.gpuSimulation.textureDimensions!
    for (let i = 0; i < this.gpuSimulation.particleCount; i++) {
      i2uvBuffer.setXY(i, (i % td[0]) / td[0], Math.floor(i / td[0]) / td[1])
    }

    geo.setAttribute('i2uv', i2uvBuffer)
    this.mesh = new InstancedMesh(geo, mat, this.gpuSimulation.particleCount)

    this.add(this.mesh)
  }
}

export default GPURendering
