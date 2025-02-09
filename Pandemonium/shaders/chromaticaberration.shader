
Shader "Custom/ChromaticAberration"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _IntensityX ("X Intensity", Range(-1, 1)) = 1
        _IntensityY ("Y Intensity", Range(-1, 1)) = 1
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

            float _IntensityX;
            float _IntensityY;
            float4 _MainTex_ST;

            struct Interpolators {
                float4 position : SV_POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            struct VertexData {
                float4 position : POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            Interpolators VertexP (VertexData v) {
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_OUTPUT(Interpolators, Interpolators o);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);

                o.position = UnityObjectToClipPos (v.position);
                o.uv = v.uv;
                return o;
            }

            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            float4 FragmentP (Interpolators i) : SV_TARGET {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);

                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);
                float4 color = tex2D(_MainTex, uv);

                // move the red channel up-right according to the direction and intensity
                color.r = tex2D(_MainTex, uv + float2(_IntensityX/50, _IntensityY/50)).r;
                // move the blue channel down-left according to the direction
                color.b = tex2D(_MainTex, uv - float2(_IntensityX/50, _IntensityY/50)).b;


                return color;
            }

            ENDCG
        }
    }
}