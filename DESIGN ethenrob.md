# Fashion Brand for Men, Women & Kids – edenrobe Pakistan

## Mission
Create implementation-ready, token-driven UI guidance for Fashion Brand for Men, Women & Kids – edenrobe Pakistan that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: Fashion Brand for Men, Women & Kids – edenrobe Pakistan
- URL: https://edenrobe.com/
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Montserrat`, `font.family.stack=Montserrat, sans-serif`, `font.size.base=17px`, `font.weight.base=400`, `font.lineHeight.base=24.48px`
- Typography scale: `font.size.xs=9px`, `font.size.sm=10px`, `font.size.md=11px`, `font.size.lg=12px`, `font.size.xl=13px`, `font.size.2xl=14px`, `font.size.3xl=15px`, `font.size.4xl=16px`
- Color palette: `color.text.primary=#151515`, `color.border.muted=#ffffff`, `color.text.tertiary=#f7f7f7`, `color.surface.base=#000000`, `color.surface.strong=#222222`
- Spacing scale: `space.1=3px`, `space.2=4px`, `space.3=5px`, `space.4=6px`, `space.5=7px`, `space.6=8px`, `space.7=10px`, `space.8=12px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=5px`, `radius.md=6px`, `radius.lg=50px`, `radius.xl=62px` | `motion.duration.instant=200ms`, `motion.duration.fast=250ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (469), buttons (90), cards (88), lists (64), inputs (15), navigation (1).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
