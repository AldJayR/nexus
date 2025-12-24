import { LoginForm } from "@/components/auth/login-form";
import PixelBlast from "@/components/pixel";
// import Beams from "@/components/pixel";

export default function LoginPage() {
	return (
		<div className="relative flex items-center justify-center w-full p-6 min-h-svh md:p-10">
			<div className="absolute top-0 left-0 h-full w-full">
				<PixelBlast
					variant="triangle"
					pixelSize={4}
					color="#1447e6"
					patternScale={3}
					patternDensity={1.2}
					pixelSizeJitter={0.5}
					enableRipples
					rippleSpeed={0.4}
					rippleThickness={0.12}
					rippleIntensityScale={1}
					speed={0.6}
					edgeFade={0.25}
					transparent
				/>
			</div>
			<div className="w-full max-w-sm z-20">
				<LoginForm />
			</div>
		</div>
	);
}
