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
  ClampToEdgeWrapping,
  Clock,
  DataTexture,
  FloatType,
  Mesh,
  NearestFilter,
  Object3D,
  PlaneBufferGeometry,
  RawShaderMaterial,
  RGBAFormat,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'

import debugVertexShader from '@/lib/graphics/shaders/raw/gpu-debug/vs-debug.glsl'
import debugFragmentShader from '@/lib/graphics/shaders/raw/gpu-debug/fs-debug.glsl'

import updatePositionsVertex from '@/lib/graphics/shaders/raw/gpu-simulation/vs-base.glsl'
import updatePositionsFragment from '@/lib/graphics/shaders/raw/gpu-simulation/fs-update-positions.glsl'

import { getTextureDimensionsPot } from '@siroko/math'
import PingPongRenderTarget from './PingPongRenderTarget'

class GPUSimulation extends Object3D {
  public textureDimensions?: Array<number>
  public currentPositionRendertarget?: WebGLRenderTarget

  private debugMesh?: Mesh<PlaneBufferGeometry, RawShaderMaterial>
  private dataTexture?: DataTexture
  private positionsPingpong?: PingPongRenderTarget
  private updatePositionsMaterial?: RawShaderMaterial

  constructor(
    public particleCount: number,
    private renderer: WebGLRenderer,
    private clock: Clock
  ) {
    super()
    this.setup()
    this.setupMaterials()
    this.currentPositionRendertarget = this.positionsPingpong?.pass(
      this.updatePositionsMaterial!
    )
    this.debugSetup()
  }

  public update() {
    this.currentPositionRendertarget = this.positionsPingpong?.pass(
      this.updatePositionsMaterial!
    )
    this.updatePositionsMaterial!.uniforms.uPositionsTexture.value = this.currentPositionRendertarget!.texture
    this.updatePositionsMaterial!.uniforms.uTime.value = this.clock.getElapsedTime()
    this.debugMesh!.material.uniforms.uTexture.value = this.currentPositionRendertarget!.texture
  }

  private setup(): void {
    this.textureDimensions = getTextureDimensionsPot(this.particleCount)
    const totalPot: number =
      this.textureDimensions![0] * this.textureDimensions![1]
    const positions: Float32Array = new Float32Array(totalPot * 4)

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 4] = (Math.random() - 0.5) * 2 * 100
      positions[i * 4 + 1] = 0
      positions[i * 4 + 2] = (Math.random() - 0.5) * 2 * 100
      positions[i * 4 + 3] = 1
    }

    this.dataTexture = new DataTexture(
      positions,
      this.textureDimensions![0],
      this.textureDimensions![1],
      RGBAFormat,
      FloatType,
      undefined,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      NearestFilter,
      NearestFilter
    )

    this.positionsPingpong = new PingPongRenderTarget(
      this.textureDimensions!,
      this.renderer
    )
  }

  private debugSetup() {
    const geo: PlaneBufferGeometry = new PlaneBufferGeometry(2, 2, 1, 1)
    const mat: RawShaderMaterial = new RawShaderMaterial({
      vertexShader: debugVertexShader,
      fragmentShader: debugFragmentShader,
      uniforms: {
        uTexture: { value: this.dataTexture },
      },
    })

    this.debugMesh = new Mesh(geo, mat)
    // this.add(this.debugMesh)
  }

  private setupMaterials() {
    this.updatePositionsMaterial = new RawShaderMaterial({
      vertexShader: updatePositionsVertex,
      fragmentShader: updatePositionsFragment,
      uniforms: {
        uPositionsTexture: { value: this.dataTexture },
        uTime: { value: 0 },
      },
    })
  }
}

export default GPUSimulation
