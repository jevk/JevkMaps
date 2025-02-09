﻿
Shader "Custom/ImageShader"
{
    Properties
    {
        _MainTex ("Intensity 0 image (camera view if empty)", 2D) = "white" {}
        _Image ("Intensity 1 image", 2D) = "white" {}
        _Intensity ("Intensity", Range(0, 1)) = 0.5
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
            float4 _MainTex_ST;
            sampler2D _Image;

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

                float4 col = tex2D(_MainTex, uv);
                float4 img = tex2D(_Image, uv);

                return lerp(col, img, _Intensity);
            }

            ENDCG
        }
    }
}