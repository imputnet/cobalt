# how to configure a cobalt instance for youtube
if you get various errors when attempting to download videos that are:
publicly available, not region locked, and not age-restricted;
then your instance's ip address may have bad reputation.

in this case you have to use disposable google accounts.
there's no other known workaround as of time of writing this document.

> [!CAUTION]
> **NEVER** use your personal google account for downloading videos via any means.
> you can use any google accounts that you're willing to sacrifice,
> but be prepared to have them **permanently suspended**.
>
> we recommend that you use accounts that don't link back to your personal google account or identity, just in case.
>
> use incognito mode when signing in.
> we also recommend using vpn/proxy services (such as [mullvad](https://mullvad.net/)).

1. if you haven't done it already, clone the cobalt repo, go to the cloned directory, and run `pnpm install`

2. run `pnpm -C api token:youtube`

3. follow instructions, use incognito mode in your browser when signing in.
i cannot stress this enough, but again, **DO NOT USE YOUR PERSONAL GOOGLE ACCOUNT**.

4. once you have the oauth token, add it to `youtube_oauth` in your cookies file.
you can see an [example here](/docs/examples/cookies.example.json).
you can have several account tokens in this file, if you like.

5. all done! enjoy freedom.

### liability
you're responsible for any damage done to any of your google accounts or any other damages. you do this by yourself and at your own risk.
