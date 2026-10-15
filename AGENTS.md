<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin rights come from `user_roles` (first signed-up user auto-promoted by trigger); never from user metadata — keeps privileges server-enforced.
- Listing media live in the private `media` bucket and are stored as long-lived signed URLs — workspace blocks public buckets.
- Brand artwork lives as real image files in `src/assets` (emblem, full lockup, monogram background), imported directly; the header shows the emblem, the footer the full lockup, and `public/favicon.png` is a square copy of the emblem — the site must stay self-hostable with no dependency on Lovable hosting.
