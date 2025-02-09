Shader "Hidden/Glitch"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _Juice ("Juice", Range(0, 2)) = 1
    }
    SubShader
    {
        // No culling or depth
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

            half4 _MainTex_ST;
            float _Juice;

            float3 mod289(float3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }

            float2 mod289(float2 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }

            float3 permute(float3 x) {
                return mod289(((x * 34.0) + 1.0) * x);
            }

            float snoise(float2 v)
            {
                const float4 C = float4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                    -0.577350269189626,  // -1.0 + 2.0 * C.x
                    0.024390243902439); // 1.0 / 41.0
                // First corner
                float2 i = floor(v + dot(v, C.yy));
                float2 x0 = v - i + dot(i, C.xx);

                // Other corners
                float2 i1;
                //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
                //i1.y = 1.0 - i1.x;
                i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
                // x0 = x0 - 0.0 + 0.0 * C.xx ;
                // x1 = x0 - i1 + 1.0 * C.xx ;
                // x2 = x0 - 1.0 + 2.0 * C.xx ;
                float4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;

                // Permutations
                i = mod289(i); // Avoid truncation effects in permutation
                float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0))
                    + i.x + float3(0.0, i1.x, 1.0));

                float3 m = max(0.5 - float3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
                m = m * m;
                m = m * m;

                // Gradients: 41 points uniformly over a line, mapped onto a diamond.
                // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

                float3 x = 2.0 * frac(p * C.www) - 1.0;
                float3 h = abs(x) - 0.5;
                float3 ox = floor(x + 0.5);
                float3 a0 = x - ox;

                // Normalise gradients implicitly by scaling m
                // Approximation of: m *= inversesqrt( a0*a0 + h*h );
                m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

                // Compute final noise value at P
                float3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            float rand(float2 co)
            {
                return frac(sin(dot(co.xy, float2(12.9898, 78.233))) * 43758.5453);
            }

            fixed4 rgbshift(sampler2D map, float2 uv, float2 offset, float power) {
                float2 value = offset * power * 0.1;

                fixed4 c1 = tex2D(map, uv - (value * 1.5));
                fixed4 c2 = tex2D(map, uv - (value * 0.75));
                fixed4 c3 = tex2D(map, uv + (value * 0.75));
                fixed4 c4 = tex2D(map, uv + (value * 1.5));

                return fixed4(c1.r, c2.g, c3.b, c4.a);
            }

            float parabola(float x, float k)
            {
                return pow(4.0 * x * (1.0 - x), k);
            }

            UNITY_DECLARE_SCREENSPACE_TEXTURE(_MainTex);

            fixed4 frag(v2f i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float time = _Time.y;
                float juice = _Juice;
                float2 uv = UnityStereoTransformScreenSpaceTex(i.uv);

                // Create large, incidental noise waves
                float noise = max(0.0, snoise(float2(time, uv.y * 0.3)) - 0.3) * (1.0 / 0.7);

                // Offset by smaller, constant noise waves
                noise = noise + (snoise(float2(time * 10.0, uv.y * 2.4)) - 0.5) * 0.15;

                // juice it up baby
                noise *= juice * 2.0;

                // Apply the noise as x displacement for every line
                float xpos = uv.x - noise * noise * 0.1;

                // chromatic abberation
                fixed4 fragColor = rgbshift(_MainTex, float2(xpos, uv.y), float2(2, 2), noise);

                // Mix in some random interference for lines
                //float offset = 1.0 - ((parabola(uv.x, 0.3) * parabola(uv.y, 0.3) * 0.5));
                //float t = uv.y * time;
                //float r = rand(float2(t, t));
                //fragColor.rgba = lerp(fragColor.rgba, float4(r, r, r, r), noise * 0.1 * offset).rgba;

                // Apply a line pattern every 4 pixels
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
