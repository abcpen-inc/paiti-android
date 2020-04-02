attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord0;
attribute vec4 a_set_color;

uniform mat4 u_projTrans;

varying vec4 v_color;
varying vec2 v_texCoords;
varying vec4 v_set_color;

void main() {
    v_color = a_color;
    v_set_color = a_set_color;
    v_texCoords = a_texCoord0;
    gl_Position = u_projTrans * a_position;
}