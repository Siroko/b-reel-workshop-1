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
  FloatType,
  HalfFloatType,
  Material,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneBufferGeometry,
  RGBAFormat,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLRenderTargetOptions,
} from 'three'

class PingPongRenderTarget {
  private pingpong?: Array<WebGLRenderTarget>
  private currentPing: number = 0

  private sceneRT: Scene = new Scene()
  private cameraRT: OrthographicCamera = new OrthographicCamera(0, 0, 0, 0)
  private meshRT: Mesh = new Mesh(
    new PlaneBufferGeometry(2, 2, 1, 1),
    undefined
  )

  constructor(
    private textureDimensions: Array<number>,
    private renderer: WebGLRenderer
  ) {
    this.setup()
    this.setRenderTargets()
  }

  public pass(mat: Material): WebGLRenderTarget {
    this.meshRT.material = mat
    this.renderer.setRenderTarget(this.pingpong![this.currentPing])
    this.renderer.render(this.sceneRT, this.cameraRT)
    this.renderer.setRenderTarget(null)
    this.currentPing = 1 - this.currentPing

    return this.pingpong![1 - this.currentPing]
  }

  private setup(): void {
    this.sceneRT.add(this.meshRT)
  }

  private setRenderTargets() {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    const opts: WebGLRenderTargetOptions = {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      format: RGBAFormat,
      type: ios ? HalfFloatType : FloatType,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    }
    this.pingpong = [
      new WebGLRenderTarget(
        this.textureDimensions[0],
        this.textureDimensions[1],
        opts
      ),
      new WebGLRenderTarget(
        this.textureDimensions[0],
        this.textureDimensions[1],
        opts
      ),
    ]
  }
}

export default PingPongRenderTarget
