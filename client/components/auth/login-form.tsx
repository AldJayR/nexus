"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type LoginActionResponse, loginAction } from "@/actions/login";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition();
  const [lastError, setLastError] = useState<LoginActionResponse | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Show toast notifications for errors
  useEffect(() => {
    if (lastError?.authError) {
      toast.error(lastError.authError.message, {
        duration: 5000,
      });
    }
  }, [lastError]);

  function onSubmit(values: LoginValues) {
    setLastError(null);

    startTransition(async () => {
      try {
        const result = await loginAction(values);

        // If result is undefined/null, a redirect likely happened (successful login)
        if (result === undefined || result === null) {
          return;
        }

        if (!result.success) {
          // Store the error but don't reset the form
          setLastError(result as LoginActionResponse);

          // Show field-specific errors if any
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              if (errors && errors.length > 0) {
                form.setError(field as keyof LoginValues, {
                  type: "manual",
                  message: errors[0],
                });
              }
            });
          }
        }
      } catch (error) {
        // Only show toast for actual errors, not navigation-related ones
        // Navigation errors typically have these characteristics
        const errorStr = String(error);
        const isNavigationError =
          errorStr.includes("NEXT_REDIRECT") ||
          errorStr.includes("redirect") ||
          errorStr.includes("navigation");

        if (!isNavigationError) {
          console.error("Unexpected login error:", error);
          toast.error("An unexpected error occurred", {
            description: "Please try again or contact support if the issue persists.",
          });
        }
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      id={field.name}
                      placeholder="m@example.com"
                      type="email"
                      disabled={isPending}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      id={field.name}
                      type="password"
                      disabled={isPending}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Field>
                <Button disabled={isPending} type="submit">
                  {isPending ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
