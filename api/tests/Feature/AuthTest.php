<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /** Each real HTTP request starts clean; in tests the JWT singleton keeps the last parsed token. */
    private function freshRequest(): void
    {
        $this->app['auth']->forgetGuards();
        $this->app['tymon.jwt']->unsetToken();
    }

    private function owner(): User
    {
        return User::factory()->create(['email' => 'owner@example.test', 'password' => 'secret-pass']);
    }

    public function test_login_returns_a_jwt(): void
    {
        $this->owner();

        $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.test', 'password' => 'secret-pass'])
            ->assertOk()
            ->assertJsonPath('token_type', 'bearer')
            ->assertJsonPath('expires_in', 15 * 60)
            ->assertJsonStructure(['access_token']);
    }

    public function test_wrong_password_is_rejected(): void
    {
        $this->owner();

        $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.test', 'password' => 'nope'])
            ->assertUnauthorized()
            ->assertJsonPath('message', __('api.invalid_credentials'));
    }

    public function test_login_is_rate_limited(): void
    {
        $this->owner();
        RateLimiter::clear('owner@example.test|127.0.0.1');

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.test', 'password' => 'nope'])->assertUnauthorized();
        }

        $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.test', 'password' => 'secret-pass'])
            ->assertStatus(429);
    }

    public function test_protected_routes_need_a_token(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $this->getJson('/api/v1/videos')->assertUnauthorized();
    }

    public function test_me_refresh_and_logout(): void
    {
        $this->owner();
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'owner@example.test', 'password' => 'secret-pass'])
            ->json('access_token');

        $this->withToken($token)->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'owner@example.test')
            ->assertJsonPath('data.theme', 'system');

        $this->withToken($token)->patchJson('/api/v1/me', ['theme' => 'dark'])
            ->assertOk()
            ->assertJsonPath('data.theme', 'dark');

        $new = $this->withToken($token)->postJson('/api/v1/auth/refresh')->assertOk()->json('access_token');
        $this->assertNotSame($token, $new);

        $this->freshRequest();
        $this->withToken($new)->getJson('/api/v1/me')->assertOk();

        // The old token is blacklisted after refresh.
        $this->freshRequest();
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();

        $this->freshRequest();
        $this->withToken($new)->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->freshRequest();
        $this->withToken($new)->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_profile_rejects_unknown_locale_and_theme(): void
    {
        $this->actingAs($this->owner(), 'api')
            ->patchJson('/api/v1/me', ['locale' => 'fr', 'theme' => 'blue'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['locale', 'theme']);
    }
}
