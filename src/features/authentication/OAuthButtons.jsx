import { getOAuthLoginUrl } from "@/services/apiAuth";
import { Button } from "@/ui/button";

export default function OAuthButtons() {
  async function handleOAuthLogin(provider) {
    const authUrl = await getOAuthLoginUrl(provider);
    console.log("redirecting to:", authUrl);

    window.location.href = authUrl;
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="outline" onClick={() => handleOAuthLogin("github")}>
        Continue with GitHub
      </Button>

      <Button variant="outline" onClick={() => handleOAuthLogin("google")}>
        Continue with Google
      </Button>
    </div>
  );
}
