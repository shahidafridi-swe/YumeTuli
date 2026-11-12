<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $token = auth('api')->attempt($request->only('email', 'password'));

        if (! $token) {
            return response()->json(['message' => __('api.invalid_credentials')], 401);
        }

        return $this->tokenResponse($token);
    }

    /** Accepts an expired token (within the refresh window) and returns a new one. */
    public function refresh(): JsonResponse
    {
        try {
            $token = auth('api')->refresh();
        } catch (JWTException) {
            return response()->json(['message' => __('api.invalid_token')], 401);
        }

        return $this->tokenResponse($token);
    }

    public function logout(): Response
    {
        auth('api')->logout();

        return response()->noContent();
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function updateMe(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user);
    }

    private function tokenResponse(string $token): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }
}
