
Shader "Custom/AAAAAA"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _Color ("Color", Color) = (1, 1, 1, 1)
        _Intensity ("Intensity", Float) = 1
        _Lerp ("Lerp", Float) = 1
        _Closing ("Closing", Range(0, 0.5)) = 0

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

            #define PI 3.1415926

            float _Intensity;
            float _Lerp;
            float _Closing;
            float4 _Color;
            sampler2D _MainTex;
            float4 _MainTex_ST;
            float4 _MainTex_TexelSize;

            struct Interpolators {
                float4 position : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            struct VertexData {
                float4 position : POSITION;
                float2 uv : TEXCOORD0;
            };

            Interpolators VertexP (VertexData v) {
                Interpolators i;
                i.position = UnityObjectToClipPos (v.position);
                i.position.g *= 1;
                i.uv = v.uv;
                return i;
            }


            float4 FragmentP (Interpolators i) : SV_TARGET {
                float time = _Time.y;
                float2 uv = UnityStereoScreenSpaceUVAdjust(i.uv.xy, _MainTex_ST);
                float2 uv2 = UnityStereoScreenSpaceUVAdjust(i.uv.xy, _MainTex_ST);
                float2 uv3 = UnityStereoScreenSpaceUVAdjust(i.uv.xy, _MainTex_ST);

                uv.x = lerp(frac(uv3.x - _Closing), frac(uv2.x + _Closing), 0.5);

                float4 ogCol = tex2D(_MainTex, uv);
                float4 color = tex2D(_MainTex, uv);

                uv3.x += sin(uv2.x - time);

                float4 col2 = tex2D(_MainTex, uv2);

                color = frac(sin(tex2D(_MainTex, uv) * (tan(uv.x) * 10 + (time * 5))));
                color = lerp(col2, color, -0.9);

                return lerp(ogCol, lerp(color, col2, _Lerp), _Intensity);//lerp(col2, color, _Fall);
            }

            ENDCG
        }
    }
}