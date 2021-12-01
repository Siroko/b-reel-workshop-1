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
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'

import debugVertexShader from '@/lib/graphics/shaders/raw/gpu-debug/vs-debug.glsl'
import debugFragmentShader from '@/lib/graphics/shaders/raw/gpu-debug/fs-debug.glsl'

import updatePositionsVertex from '@/lib/graphics/shaders/raw/gpu-simulation/vs-base.glsl'
import updatePositionsFragment from '@/lib/graphics/shaders/raw/gpu-simulation/fs-update-positions.glsl'
import updateVelocitiesFragment from '@/lib/graphics/shaders/raw/gpu-simulation/fs-update-velocities.glsl'

import { getTextureDimensionsPot } from '@siroko/math'
import PingPongRenderTarget from './PingPongRenderTarget'

class GPUSimulation extends Object3D {
  public textureDimensions?: Array<number>
  public currentPositionRendertarget?: WebGLRenderTarget

  private debugMesh?: Mesh<PlaneBufferGeometry, RawShaderMaterial>
  private positionsDataTexture?: DataTexture
  private positionsPingpong?: PingPongRenderTarget
  private updatePositionsMaterial?: RawShaderMaterial

  private velocitiesDataTexture?: DataTexture
  private velocitiesPingpong?: PingPongRenderTarget
  private updateVelocitiesMaterial?: RawShaderMaterial
  private currentVelocitiesRendertarget?: WebGLRenderTarget

  public alignFactor: number = 1.766
  public cohesionFactor: number = 1.733
  public separationFactor: number = 3.07
  public forceToCenterFactor: number = 0.0169
  public rangeAlign: number = 6.38
  public rangeCohesion: number = 6.38
  public range: number = 6.121
  public maxSpeed: number = 26.766
  public maxForce: number = 0.938

  constructor(
    public particleCount: number,
    private renderer: WebGLRenderer,
    private clock: Clock
  ) {
    super()
    this.setup()
    this.setupMaterials()
    this.updateRenderTargets()
    this.debugSetup()
  }

  public update() {
    this.updateRenderTargets()

    this.updatePositionsMaterial!.uniforms.uPositionsTexture.value = this.currentPositionRendertarget!.texture
    this.updatePositionsMaterial!.uniforms.uVelocitiesTexture.value = this.currentVelocitiesRendertarget!.texture
    this.updatePositionsMaterial!.uniforms.uDeltaTime.value = this.clock.getDelta()
    this.updatePositionsMaterial!.uniforms.uTime.value = this.clock.getElapsedTime()

    this.updateVelocitiesMaterial!.uniforms.uPositionsTexture.value = this.currentPositionRendertarget!.texture
    this.updateVelocitiesMaterial!.uniforms.uVelocitiesTexture.value = this.currentVelocitiesRendertarget!.texture
    this.updateVelocitiesMaterial!.uniforms.uDeltaTime.value = this.clock.getDelta()
    this.updateVelocitiesMaterial!.uniforms.uTime.value = this.clock.getElapsedTime()
    this.updateVelocitiesMaterial!.uniforms.uTotalParticles.value = this.particleCount
    this.updateVelocitiesMaterial!.uniforms.uAlignFactor.value = this.alignFactor
    this.updateVelocitiesMaterial!.uniforms.uCohesionFactor.value = this.cohesionFactor
    this.updateVelocitiesMaterial!.uniforms.uSeparationFactor.value = this.separationFactor
    this.updateVelocitiesMaterial!.uniforms.uForceToCenterFactor.value = this.forceToCenterFactor
    this.updateVelocitiesMaterial!.uniforms.uRange.value = this.range
    this.updateVelocitiesMaterial!.uniforms.uMaxSpeed.value = this.maxSpeed
    this.updateVelocitiesMaterial!.uniforms.uMaxForce.value = this.maxForce

    this.debugMesh!.material.uniforms.uTexture.value = this.currentVelocitiesRendertarget!.texture
  }

  private updateRenderTargets() {
    this.currentPositionRendertarget = this.positionsPingpong?.pass(
      this.updatePositionsMaterial!
    )
    this.currentVelocitiesRendertarget = this.velocitiesPingpong?.pass(
      this.updateVelocitiesMaterial!
    )
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
      positions[i * 4 + 3] = Math.random()
    }

    this.positionsDataTexture = new DataTexture(
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

    const velocities: Float32Array = new Float32Array(totalPot * 4)

    for (let i = 0; i < this.particleCount; i++) {
      velocities[i * 4] = (Math.random() - 0.5) * 2
      velocities[i * 4 + 1] = 0
      velocities[i * 4 + 2] = (Math.random() - 0.5) * 2
      velocities[i * 4 + 3] = Math.random()
    }

    this.velocitiesDataTexture = new DataTexture(
      velocities,
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

    this.velocitiesPingpong = new PingPongRenderTarget(
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
        uTexture: { value: this.currentPositionRendertarget!.texture },
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
        uPositionsTexture: { value: this.positionsDataTexture },
        uVelocitiesTexture: { value: this.velocitiesDataTexture },
        uTime: { value: 0 },
        uDeltaTime: { value: this.clock.getDelta() },
      },
    })

    const resolution: Vector2 = new Vector2(
      this.textureDimensions![0],
      this.textureDimensions![1]
    )

    this.updateVelocitiesMaterial = new RawShaderMaterial({
      vertexShader: updatePositionsVertex,
      fragmentShader: updateVelocitiesFragment,
      uniforms: {
        uPositionsTexture: { value: this.positionsDataTexture },
        uVelocitiesTexture: { value: this.velocitiesDataTexture },
        uTime: { value: 0 },
        uResolution: {
          value: resolution,
        },
        uDeltaTime: { value: this.clock.getDelta() },
        uTotalParticles: { value: this.particleCount },
        uAlignFactor: { value: this.alignFactor },
        uCohesionFactor: { value: this.cohesionFactor },
        uSeparationFactor: { value: this.separationFactor },
        uForceToCenterFactor: { value: this.forceToCenterFactor },
        uRange: { value: this.range },
        uMaxSpeed: { value: this.maxSpeed },
        uMaxForce: { value: this.maxForce },
      },
    })
  }
}

export default GPUSimulation
