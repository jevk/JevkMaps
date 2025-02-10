
Shader "Custom/pixelate"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _Pixels ("Pixels", Range(0, 2000)) = 0
    }
    SubShader
    {
        Cull Off
        ZWrite Off
        ZTest Always

        Pass
        {
            CGPROGRAM
            
            #pragma vertex VertexP
            #pragma fragment FragmentP

            #include "UnityCG.cginc"

            float _Pixels;
            sampler2D _Line;
            //float4 _MainTex_ST;
            float4 _MainTex_TexelSize;

            struct VertexData {
                float4 position : POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Interpolators {
                float4 position : SV_POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            Interpolators VertexP (VertexData v) {
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_OUTPUT(Interpolators, Interpolators o);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);

                o.position = UnityObjectToClipPos (v.position);
                o.position.g *= 1;
                o.uv = v.uv;
                return o;
            }

            float4 FragmentP (Interpolators i) : SV_TARGET {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);

                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);

                float dx = 15 * (1 / _Pixels);
                float dy = 10 * (1 / _Pixels);

                float2 Coord = float2(dx * floor(uv.x / dx), dy * floor(uv.y / dy));

                fixed4 col = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, Coord);
             
                return col;// + sin(_Intensity) * cos(time / r * t) * _Intensity;
            }

            ENDCG
        }
    }
}