Shader "Custom/ChromaticAberration_VR"
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
            
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"

            float _IntensityX;
            float _IntensityY;
            float4 _MainTex_ST;

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

            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            float4 frag (v2f i) : SV_TARGET {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);

                // Ensure UVs are correctly adjusted for stereo rendering
                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);
                float2 offset = float2(_IntensityX, _IntensityY) * 0.02; // Adjusted for VR clarity

                float4 color = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv);
                color.r = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv + offset).r; // Red shift up-right
                color.b = UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, uv - offset).b; // Blue shift down-left

                return color;
            }

            ENDCG
        }
    }
}
