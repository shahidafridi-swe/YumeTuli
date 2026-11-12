<?php

namespace App\Enums;

enum RunKind: string
{
    case Plan = 'plan';
    case Build = 'build';
    case Feedback = 'feedback';
}
