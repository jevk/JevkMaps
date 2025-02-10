Shader "Custom/GaussianBlur"
{ 
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        radius ("Radius", Range(0,30)) = 15
        resolution ("Resolution", float) = 800  
        hstep("HorizontalStep", Range(0,1)) = 0.5
        vstep("VerticalStep", Range(0,1)) = 0.5  
    }

    SubShader
    {
        Tags {"Queue"="Overlay" "RenderType"="Transparent"}
        ZWrite Off Blend SrcAlpha OneMinusSrcAlpha Cull Off
        Pass
        {    
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma fragmentoption ARB_precision_hint_fastest
            #include "UnityCG.cginc"

            // Define appdata_t and v2f
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

            float radius;
            float resolution;

            float hstep;
            float vstep;

            half4 _MainTex_ST;
            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            float4 frag(v2f i) : COLOR
            {    
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);
                float4 sum = float4(0.0, 0.0, 0.0, 0.0);
                float2 tc = uv;

                // Calculate dynamic blur based on resolution
                float blur = radius / (resolution * 4.0); 

                // Perform the blur effect
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(-4.0, -4.0) * blur) * 0.0162162162;
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(-3.0, -3.0) * blur) * 0.0540540541;
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(-2.0, -2.0) * blur) * 0.1216216216;
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(-1.0, -1.0) * blur) * 0.1945945946;

                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc) * 0.2270270270;

                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(1.0, 1.0) * blur) * 0.1945945946;
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(2.0, 2.0) * blur) * 0.1216216216;
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(3.0, 3.0) * blur) * 0.0540540541;
                sum += UNITY_SAMPLE_SCREENSPACE_TEXTURE(_MainTex, tc + float2(4.0, 4.0) * blur) * 0.0162162162;

                return float4(sum.rgb, 1);
            }    

            ENDCG
        }
    }
    Fallback "Sprites/Default"    
}
