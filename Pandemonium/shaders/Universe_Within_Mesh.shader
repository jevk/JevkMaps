//v 1.0
//A bit optimized and configurated for using in unity by Doppelgänger#8376
//Basically for vrchat animations

//Original shader: https://www.shadertoy.com/view/lscczl
//Original shader License: Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0)

//v 1.01
//increased Fade Center range

//v 1.02
//Added Rotation option
//Added 2nd Version for models
Shader "Doppels shaders/Models shaders/Best Universe Within 1.02"
{
    Properties
    {
        [ToggleUI]UFPS("Use For Particle System", int) = 0
        [Enum(Alpha Blended, 0, Additive, 1)]B("Blending", int) = 1
        [Enum(UnityEngine.Rendering.CullMode)]_Cull("Cull", float) = 2
        [Enum(Off, 0, On, 1)]_ZWrite("ZWrite", int) = 1
        _fs("Center Offset X", float) = 0.0
		_fe("Center Offset Y", float) = 0.0
        _MainTex("Main Texture", 2D) = "white" {}
        _tc("Texture Color", color) = (0,0,0,1)
        [IntRange]_samples("Samples", range(2, 10)) = 3
        _scale("Scale", range(0, 1)) = 0.5
        _ms("Moving Speed", range(0, 1)) = 0.025
        _mo("Manual Offset", float) = 0.0
        _sms("Segments Moving Speed", range(0, 1)) = 0.1
        _smo("Segments Manual Offset", float) = 0.0
        _dbs("Dots Blinking Speed", range(0, 1)) = 0.2
        _s("Dots Power", range(0, 1)) = 0.25
        _lpow("Lines Power", range(0, 1)) = 1.0
        _lt("Lines Thickness", range(0, 1)) = 0.0
        _rspeed("Rotation Speed", float) = 0.0
        _roffset("Rotation Offset", float) = 0.0
        _near("Near", float) = 0.1
        _far("Far", float) = 2.0
        _appearfade("Appear Fade Range", range(0, 1.0)) = 0.1
        _disappearfade("Dissappear Fade Range", range(0, 1.0)) = 0.2
        _Color("Color", color) = (1,1,1,1)
        _rb("Rainbow", range(0, 1)) = 0.0
        _rbo("Rainbow Offset", float) = 0.0
        _rbs("Rainbow Speed", range(0, 1)) = 0.0
        _v("Fade Center", range(0, 1)) = 0.0
        _Src("", int) = 1
        _Dst("", int) = 1
    }

    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent" }
        ColorMask RGB
        Blend [_Src] [_Dst] 
        Cull [_Cull]
        ZWrite [_ZWrite]
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct VertexData {
                float4 position : POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct v2f
            {
                float4 p : SV_POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            uniform sampler2D _MainTex;
            uniform float4 _MainTex_ST;
            uniform float4 _Color, _tc;
            uniform int _samples, B;
            uniform float _fs, _fe, _v, _scale, _rb, _rbs, _rbo, _ms, _sms, _mo, _smo, _far, _near, _dbs, _s, _lpow, _lt, _rspeed, _roffset, _disappearfade, _appearfade;

            v2f vert(VertexData v)
            {
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_OUTPUT(v2f, v2f o);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);

                o.p = UnityObjectToClipPos(v.position);
                o.uv = v.uv;  // Adjust for VR stereo

                return o;
            }

            inline float2 rotate(float2 p, float t)
            {
                float s, c;
                sincos(t, s, c);
                return mul(p, float2x2(c, s, -s, c));
            }

            float2 N22(float2 p)
            {
                return frac(47865.7984 * sin(float2(dot(p, float2(23.472, 41.7541)), dot(p, float2(51.9123, 27.985)))));
            }

            float sdSegment(float2 a, float2 b, float2 p)
            {
                float2 pa = p - a, ba = b - a;
                float h = saturate(dot(pa, ba) / (0.00000001 + dot(ba, ba))); //division by zero warning? net, spasibo.
                return length(pa - ba * h);
            }

            float drawline(float2 a, float2 b, float2 p)
            {
                float d1 = sdSegment(a, b, p);
                float d2 = length(a - b);
                float fade = smoothstep(1.5, 0.5, d2);
                fade += smoothstep(0.05, 0.02, abs(d2 - 0.75));
                return saturate(pow((0.005 + _lt*0.025) / d1, 2.0+_lt*1.5)) * fade;
            }

            float layer(float2 st)
            {
                float2 id = floor(st + 0.5); st = frac(st + 0.5) - 0.5;
                float2 p[9]; float c = 0.0; int j = 0.0;
                for(int y = -1; y <= 1; y++)
                {
                    for(int x = -1; x <= 1; x++)
                    {
                        p[j] = float2(x, y) + sin(N22(id + float2(x, y)) * 7.213 + _smo + 10.0 * _sms * _Time.y) * 0.45;
                        UNITY_BRANCH if (_s)
                        {
                            float d = length(st - p[j]);
                            float s = pow(0.1 / d, 3.5) * _s;
                            UNITY_BRANCH if (_dbs)
                            {
                                float pulse = sin((frac(p[j].x) + frac(p[j].y) + _dbs * 5.0 * _Time.y) * 5.0) * 0.5 + 0.5;
                                pulse = pow(pulse, 5.0);
                                s *= pulse;
                            }
                            c += s;
                        }
                        j++;
                    }
                }
 
                UNITY_BRANCH if (_lpow)
                {
                    float l = 0.0;

                    for(int i = 0; i < 9; i++)
                    {
                        l += drawline(p[4], p[i], st);
                    }

                    l += drawline(p[1], p[3], st);
                    l += drawline(p[1], p[5], st);
                    l += drawline(p[7], p[5], st);
                    l += drawline(p[7], p[3], st);

                    c += l * _lpow;
                }

                return c;
            }

            float3 HSVToRGB(float3 c)
            {
                float4 K = float4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                float3 p = saturate(abs(frac(c.xxx + K.xyz) * 6.0 - K.www) - K.xxx);
                return c.z * lerp(K.xxx, p, c.y);
            }

            fixed4 frag (v2f i) : SV_Target
            {
                fixed3 col = 0.0, rc = 1.0;
                float2 p = i.uv - 0.5 - float2(_fs, _fe), uv = i.uv;
                float is = 1.0 / _samples;
                for (int i = 0; i < _samples; i++)
                {
                    UNITY_BRANCH if (_rspeed || _roffset)
                    {
                        p = rotate(p, _Time.y * _rspeed / (i + 1.0) + _roffset);
                    }
                    float t = frac(_ms * 10.0 * _Time.y + _mo + i * is);
                    float s = lerp(_far, _near, t);
                    float f = smoothstep(0.0, _appearfade, t) * smoothstep(0.0, _disappearfade, 1.0 - t);
                    UNITY_BRANCH if (_rb)
                    {
                        rc = HSVToRGB(float3(i * is + _rbo + _Time.y * _rbs, _rb, 1));
                    }
                    col += layer(p * s * (_scale * 9.0 + 1.0) + i * 100) * f * rc;
                }
                float4 tex = tex2D(_MainTex, TRANSFORM_TEX(uv, _MainTex)) * _tc;
                float a = 1.0;
                col = saturate(col * _Color) + tex;
                if (B)
                {
                    col.rgb *= tex.a;
                }
                else
                {
                    a = tex.a;
                }
                return fixed4(col, a);
            }
            ENDCG
        }
    }
}
