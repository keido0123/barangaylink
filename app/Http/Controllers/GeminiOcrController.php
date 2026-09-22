<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeminiOcrController extends Controller
{
    public function extract(Request $request)
    {
        try {

            // =====================================================
            // VALIDATION
            // =====================================================
            $request->validate([
                'image' => [
                    'required',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:8192',
                ],

                'side' => [
                    'required',
                    'in:front,back',
                ],
            ]);

            // =====================================================
            // API KEY
            // =====================================================
            $apiKey = config('services.gemini.key');

            if (!$apiKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini API key is missing.',
                ], 500);
            }

            // =====================================================
            // GET IMAGE AND SIDE
            // =====================================================
            $file = $request->file('image');
            $side = $request->input('side');

            // =====================================================
            // MIME TYPE
            // =====================================================
            $mimeType = $file->getMimeType();

            if (!$mimeType) {
                $mimeType = $file->getClientMimeType();
            }

            // =====================================================
            // READ IMAGE
            // =====================================================
            $imageBytes = file_get_contents(
                $file->getRealPath()
            );

            if ($imageBytes === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to read uploaded image.',
                ], 400);
            }

            // =====================================================
            // BASE64
            // =====================================================
            $base64Image = base64_encode(
                $imageBytes
            );

            // =====================================================
            // PROMPT
            // =====================================================
            if ($side === 'front') {

                $prompt = <<<'PROMPT'
You are an OCR extraction system for a Philippine National ID
(PhilSys / Pambansang Pagkakakilanlan).

Read ONLY the information visible on the FRONT side of the ID.

Return ONLY valid JSON.

Use exactly this structure:

{
  "lastName": "",
  "firstName": "",
  "middleName": "",
  "birthdate": "",
  "address": ""
}

RULES:

1. lastName:
   Read the Apelyido / Last Name.

2. firstName:
   Read the Mga Pangalan / Given Names.
   Keep all given names.

3. middleName:
   Read the Gitnang Apelyido / Middle Name.

4. birthdate:
   Read the Petsa ng Kapanganakan / Date of Birth.
   Convert it to YYYY-MM-DD.

5. address:
   Read the COMPLETE Tirahan / Address.
   Do not shorten the address.
   Preserve as much of the visible address as possible.

6. Do NOT guess information.

7. If a field cannot be read, return an empty string.

8. Return ONLY JSON.
   Do not use markdown.
   Do not add explanations.
PROMPT;

            } else {

                $prompt = <<<'PROMPT'
You are an OCR extraction system for the BACK side of a
Philippine National ID (PhilSys / Pambansang Pagkakakilanlan).

Your main task is to identify SEX/GENDER and CIVIL STATUS.

Look carefully at the entire image.

Look especially for labels such as:

- KASARIAN
- SEX
- GENDER
- KALAGAYANG SIBIL
- CIVIL STATUS
- MARITAL STATUS

Return ONLY valid JSON.

Use exactly this structure:

{
  "gender": "",
  "civilStatus": ""
}

GENDER RULES:

If the visible value means:

M
MALE
LALAKI
L

return:

"Male"

If the visible value means:

F
FEMALE
BABAE
B

return:

"Female"

Only return:

"Male"
"Female"
""

Do not guess.

CIVIL STATUS RULES:

If the visible value means:

SINGLE

return:

"Single"

If the visible value means:

MARRIED

return:

"Married"

If the visible value means:

WIDOWED
WIDOW

return:

"Widowed"

If the visible value means:

SEPARATED
LEGALLY SEPARATED

return:

"Separated"

If the field cannot be read, return:

""

IMPORTANT:

Do not guess the person's gender or civil status.

Use only information actually visible in the image.

Return ONLY JSON.

Do not use markdown.
Do not add explanations.
PROMPT;
            }

            // =====================================================
            // PAYLOAD
            // =====================================================
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inlineData' => [
                                    'mimeType' => $mimeType,
                                    'data' => $base64Image,
                                ],
                            ],
                            [
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],

                'generationConfig' => [
                    'temperature' => 0,
                    'responseMimeType' => 'application/json',
                ],
            ];

            // =====================================================
            // GEMINI MODELS
            // =====================================================
            $models = [
                'gemini-3.8-flash',
                'gemini-3.7-flash',
            ];

            // =====================================================
            // SETTINGS
            // =====================================================
            $maxAttempts = 2;

            $response = null;
            $usedModel = null;

            // =====================================================
            // GEMINI REQUEST
            // =====================================================
            foreach ($models as $model) {

                // IMPORTANT:
                // This is a NORMAL URL.
                // Do NOT put Markdown [ ] ( ) here.
                $url =
                    'https://generativelanguage.googleapis.com/v1beta/models/'
                    . $model
                    . ':generateContent';

                Log::info('Starting Gemini OCR request', [
                    'side' => $side,
                    'model' => $model,
                ]);

                for (
                    $attempt = 1;
                    $attempt <= $maxAttempts;
                    $attempt++
                ) {

                    try {

                        // =================================================
                        // SEND REQUEST
                        // =================================================
                        $response = Http::withHeaders([
                            'x-goog-api-key' => $apiKey,
                            'Content-Type' => 'application/json',
                        ])
                        ->connectTimeout(5)
                        ->timeout(12)
                        ->post($url, $payload);

                        // =================================================
                        // SUCCESS
                        // =================================================
                        if ($response->successful()) {

                            $usedModel = $model;

                            Log::info('Gemini OCR successful', [
                                'side' => $side,
                                'model' => $model,
                                'attempt' => $attempt,
                                'status' => $response->status(),
                            ]);

                            break 2;
                        }

                        // =================================================
                        // ERROR INFORMATION
                        // =================================================
                        $status = $response->status();
                        $body = $response->body();

                        Log::warning('Gemini OCR failed', [
                            'side' => $side,
                            'model' => $model,
                            'attempt' => $attempt,
                            'status' => $status,
                            'body' => $body,
                        ]);

                        // =================================================
                        // DAILY QUOTA EXCEEDED
                        // =================================================
                        // DO NOT RETRY THIS.
                        //
                        // Your previous log showed:
                        //
                        // GenerateRequestsPerDayPerProjectPerModel-FreeTier
                        //
                        // This means the daily quota has been reached.
                        // =================================================
                        if (
                            $status === 429 &&
                            (
                                str_contains(
                                    $body,
                                    'GenerateRequestsPerDayPerProjectPerModel-FreeTier'
                                )
                                ||
                                str_contains(
                                    $body,
                                    'exceeded your current quota'
                                )
                            )
                        ) {

                            Log::error(
                                'Gemini daily quota exceeded',
                                [
                                    'side' => $side,
                                    'model' => $model,
                                    'status' => $status,
                                ]
                            );

                            return response()->json([
                                'success' => false,
                                'message' =>
                                    'Gemini daily quota has been reached. Please try again after the quota resets.',
                                'side' => $side,
                                'quota_exceeded' => true,
                            ], 429);
                        }

                        // =================================================
                        // OTHER 429 RATE LIMIT
                        // =================================================
                        if ($status === 429) {

                            if ($attempt < $maxAttempts) {
                                sleep(2);
                            }

                            continue;
                        }

                        // =================================================
                        // TEMPORARY SERVER ERRORS
                        // =================================================
                        if (
                            in_array(
                                $status,
                                [408, 500, 502, 503, 504],
                                true
                            )
                        ) {

                            if ($attempt < $maxAttempts) {
                                sleep(2);
                            }

                            continue;
                        }

                        // =================================================
                        // NON-RETRYABLE ERROR
                        // =================================================
                        Log::error(
                            'Gemini non-retryable error',
                            [
                                'side' => $side,
                                'model' => $model,
                                'status' => $status,
                                'body' => $body,
                            ]
                        );

                        break;

                    } catch (Throwable $e) {

                        Log::error(
                            'Gemini HTTP exception',
                            [
                                'side' => $side,
                                'model' => $model,
                                'attempt' => $attempt,
                                'message' => $e->getMessage(),
                            ]
                        );

                        if ($attempt < $maxAttempts) {
                            sleep(2);
                        }
                    }
                }
            }

            // =====================================================
            // ALL MODELS FAILED
            // =====================================================
            if (
                !$response ||
                !$response->successful()
            ) {

                Log::error(
                    'All Gemini OCR attempts failed',
                    [
                        'side' => $side,
                        'status' => $response?->status(),
                        'body' => $response?->body(),
                    ]
                );

                $status = $response?->status();

                // =================================================
                // RATE LIMIT
                // =================================================
                if ($status === 429) {

                    return response()->json([
                        'success' => false,
                        'message' =>
                            'Gemini rate limit reached. Please try again later.',
                        'side' => $side,
                    ], 429);
                }

                // =================================================
                // TEMPORARY SERVER ERROR
                // =================================================
                if (
                    in_array(
                        $status,
                        [408, 500, 502, 503, 504],
                        true
                    )
                ) {

                    return response()->json([
                        'success' => false,
                        'message' =>
                            'Gemini is temporarily busy. Please try scanning again.',
                        'side' => $side,
                    ], 503);
                }

                // =================================================
                // OTHER ERROR
                // =================================================
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini OCR request failed.',
                    'side' => $side,
                ], 500);
            }

            // =====================================================
            // GEMINI RESPONSE
            // =====================================================
            $json = $response->json();

            Log::info('Gemini OCR Response', [
                'side' => $side,
                'model' => $usedModel,
                'response' => $json,
            ]);

            // =====================================================
            // GET GENERATED TEXT
            // =====================================================
            $text =
                $json['candidates'][0]['content']['parts'][0]['text']
                ?? null;

            if (!$text) {

                return response()->json([
                    'success' => false,
                    'message' => 'Gemini returned no OCR text.',
                    'raw' => $json,
                ], 502);
            }

            // =====================================================
            // CLEAN JSON
            // =====================================================
            $text = trim($text);

            // Remove ```json
            $text = preg_replace(
                '/^```(?:json)?\s*/i',
                '',
                $text
            );

            // Remove ```
            $text = preg_replace(
                '/\s*```$/',
                '',
                $text
            );

            $text = trim($text);

            // =====================================================
            // DECODE JSON
            // =====================================================
            $data = json_decode(
                $text,
                true
            );

            if (
                json_last_error() !== JSON_ERROR_NONE ||
                !is_array($data)
            ) {

                Log::error(
                    'Gemini returned invalid JSON',
                    [
                        'text' => $text,
                        'json' => $json,
                    ]
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Gemini returned invalid JSON.',
                    'raw_text' => $text,
                ], 502);
            }

            // =====================================================
            // FRONT RESULT
            // =====================================================
            if ($side === 'front') {

                $result = [
                    'lastName' => trim(
                        (string) (
                            $data['lastName'] ?? ''
                        )
                    ),

                    'firstName' => trim(
                        (string) (
                            $data['firstName'] ?? ''
                        )
                    ),

                    'middleName' => trim(
                        (string) (
                            $data['middleName'] ?? ''
                        )
                    ),

                    'birthdate' => trim(
                        (string) (
                            $data['birthdate'] ?? ''
                        )
                    ),

                    'address' => trim(
                        (string) (
                            $data['address'] ?? ''
                        )
                    ),
                ];
            }

            // =====================================================
            // BACK RESULT
            // =====================================================
            else {

                $gender = trim(
                    (string) (
                        $data['gender'] ?? ''
                    )
                );

                $civilStatus = trim(
                    (string) (
                        $data['civilStatus'] ?? ''
                    )
                );

                // =================================================
                // NORMALIZE GENDER
                // =================================================
                $genderLower = strtolower($gender);

                if (
                    in_array(
                        $genderLower,
                        [
                            'male',
                            'm',
                            'lalaki',
                            'l',
                        ],
                        true
                    )
                ) {

                    $gender = 'Male';

                } elseif (
                    in_array(
                        $genderLower,
                        [
                            'female',
                            'f',
                            'babae',
                            'b',
                        ],
                        true
                    )
                ) {

                    $gender = 'Female';

                } else {

                    $gender = '';
                }

                // =================================================
                // NORMALIZE CIVIL STATUS
                // =================================================
                $civilLower = strtolower(
                    $civilStatus
                );

                if (
                    str_contains(
                        $civilLower,
                        'single'
                    )
                ) {

                    $civilStatus = 'Single';

                } elseif (
                    str_contains(
                        $civilLower,
                        'married'
                    )
                ) {

                    $civilStatus = 'Married';

                } elseif (
                    str_contains(
                        $civilLower,
                        'widowed'
                    )
                    ||
                    str_contains(
                        $civilLower,
                        'widow'
                    )
                ) {

                    $civilStatus = 'Widowed';

                } elseif (
                    str_contains(
                        $civilLower,
                        'separated'
                    )
                ) {

                    $civilStatus = 'Separated';

                } else {

                    $civilStatus = '';
                }

                $result = [
                    'gender' => $gender,
                    'civilStatus' => $civilStatus,
                ];
            }

            // =====================================================
            // SUCCESS
            // =====================================================
            return response()->json([
                'success' => true,
                'side' => $side,
                'model' => $usedModel,
                'data' => $result,
            ]);

        } catch (Throwable $e) {

            // =====================================================
            // CATCH EVERYTHING
            // =====================================================
            Log::error(
                'Gemini OCR Laravel Exception',
                [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Laravel Gemini OCR error.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}