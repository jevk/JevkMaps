Shader "Custom/Grayscale_VR"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _Intensity ("Intensity", Range(0, 1)) = 1
        _Color ("Color", Color) = (1, 1, 1, 1)
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

            float _Intensity;
            float4 _Color;

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

                o.position = UnityObjectToClipPos(v.position);
                o.uv = v.uv;
                return o;
            }

            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            float4 FragmentP (Interpolators i) : SV_TARGET {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);

                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);
                float4 color = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv);

                // Calculate grayscale intensity
                float grayscale = dot(color.rgb, float3(0.299, 0.587, 0.114));

                // Blend with original color based on intensity
                color.rgb = lerp(color.rgb, grayscale.xxx, _Intensity);

                return color * _Color;
            }

            ENDCG
        }
    }
}
