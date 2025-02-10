Shader "Hidden/Glitch_VR"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _Juice ("Juice", Range(0, 2)) = 1
    }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            v2f vert (appdata v)
            {
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_OUTPUT(v2f, v2f o);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;

                return o;
            }

            float _Juice;
            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            fixed4 rgbshift(float2 uv, float2 offset, float power) 
            {
                float2 shift = offset * power * 0.1;

                fixed4 c1 = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv - (shift * 1.5));
                fixed4 c2 = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv - (shift * 0.75));
                fixed4 c3 = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv + (shift * 0.75));
                fixed4 c4 = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv + (shift * 1.5));

                return fixed4(c1.r, c2.g, c3.b, c4.a);
            }

            fixed4 frag(v2f i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float time = _Time.y;
                float juice = _Juice;
                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);

                // Generate large noise waves
                float noise = max(0.0, sin(time + uv.y * 0.3) - 0.3) * (1.0 / 0.7);
                noise += (sin(time * 10.0 + uv.y * 2.4) - 0.5) * 0.15;
                noise *= juice * 2.0;

                // Apply noise as X displacement for scanline effect
                float xpos = uv.x - noise * noise * 0.1;

                // Apply chromatic aberration effect
                fixed4 fragColor = rgbshift(float2(xpos, uv.y), float2(2, 2), noise);

                // Apply scanline effect every 4 pixels
                if (floor(fmod(uv.y * 0.25, 3.0)) == 0.0)
                {
                    fragColor.rgba *= 1.0 - (0.15 * noise);
                }

                return fragColor;
            }
            ENDCG
        }
    }
}
