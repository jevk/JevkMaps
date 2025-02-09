﻿
Shader "Custom/kickwow"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _Intensity ("Intensity", Range(0, 2)) = 1
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
            
            float rand(float2 co)
            {
                return frac(sin(dot(co.xy, float2(12.9898, 78.233))) * 43758.5453);
            }

            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            float4 FragmentP (Interpolators i) : SV_TARGET {
                float time = _Time.y;
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);

                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);
                float t = uv.y * time;
                float r = rand(float2(t, t));
                uv.x += sin(r * r / 10) * _Intensity * 4;
                
                return tex2D(_MainTex, uv) * _Color; //+ (sin(r * time) * (cos(sin(time) * sin(r))) * _Intensity);
            }

            ENDCG
        }
    }
}