import { BufferGeometry, Float32BufferAttribute, Mesh, OrthographicCamera, RawShaderMaterial, Scene, type IUniform } from "three";

/**
 * A scene that is nothing but one full-screen triangle carrying a fragment shader: the
 * cheapest way to draw a shader across a canvas. One triangle beats a two-triangle quad
 * because there is no seam down the middle for the GPU to shade twice.
 */
export type ScreenQuad = {
  scene: Scene;
  camera: OrthographicCamera;
  material: RawShaderMaterial;
  dispose: () => void;
};

const VERTEX = `
precision mediump float;
attribute vec3 position;
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export function createScreenQuad(fragmentShader: string, uniforms: Record<string, IUniform>): ScreenQuad {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));

  const material = new RawShaderMaterial({ vertexShader: VERTEX, fragmentShader, uniforms, depthTest: false, depthWrite: false });

  const mesh = new Mesh(geometry, material);
  // The vertex shader ignores every matrix, so the mesh must never be culled by the camera.
  mesh.frustumCulled = false;

  const scene = new Scene();
  scene.add(mesh);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    scene,
    camera,
    material,
    dispose: () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    },
  };
}
