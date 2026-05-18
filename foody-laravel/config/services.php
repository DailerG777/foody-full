<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'wompi' => [
        'env' => env('WOMPI_ENV', 'sandbox'),
        'public_key' => env('WOMPI_PUBLIC_KEY'),
        'private_key' => env('WOMPI_PRIVATE_KEY'),
        'integrity_key' => env('WOMPI_INTEGRITY_KEY'),
        'webhook_secret' => env('WOMPI_WEBHOOK_SECRET'),
    ],

    'nequi' => [
        'numero' => env('NEQUI_NUMERO'),
        'titular' => env('NEQUI_NOMBRE_TITULAR', 'Foody Ocaña'),
    ],

    'daviplata' => [
        'numero' => env('DAVIPLATA_NUMERO'),
        'titular' => env('DAVIPLATA_NOMBRE_TITULAR', 'Foody Ocaña'),
    ],

];
