#ifdef GL_ES
    precision mediump float;
#endif

varying vec4 v_color;
varying vec2 v_texCoords;
varying vec4 v_set_color;
uniform sampler2D u_texture;
uniform mat4 u_projTrans;

void main() {

        //vec4 resultvec4 = vec4(1, 0.2, 0.2, 1);
        vec4 result =  v_set_color * texture2D(u_texture, v_texCoords);
        gl_FragColor = vec4(result.r , result.g , result.b, result.a);
}