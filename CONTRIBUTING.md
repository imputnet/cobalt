# contributing to cobalt
if you're reading this, you are probably interested in contributing to cobalt, which we are very thankful for :3

this document serves as a guide to help you make contributions that we can merge into the cobalt codebase.

## translations
currently, we are **not accepting** translations of cobalt. this is because we are making significant changes to the frontend, and the currently used localization structure is being completely reworked. if this changes, this document will be updated.

## adding features or support for services
before putting in the effort to implement a feature, it's worth considering whether it would be appropriate to add it to cobalt. the cobalt api is built to assist people **only with downloading freely accessible content**. other functionality, such as:
- downloading paid / not publicly accessible content
- downloading content protected by DRM
- scraping unrelated information & exposing it outside of file metadata

will not be reviewed or merged.

if you plan on adding a feature or support for a service, but are unsure whether it would be appropriate, it's best to open an issue and discuss it beforehand.

## git
when contributing code to cobalt, there are a few guidelines in place to ensure that the code history is readable and comprehensible.

### clean commit messages
internally, we use a format similar to [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) - the first part signifies which part of the code you are changing (the *scope*), and the second part explains the change. for inspiration on how to write appropriate commit titles, you can take a look at the [commit history](https://github.com/imputnet/cobalt/commits/).

the scope is not strictly defined, you can write whatever you find most fitting for the particular change. suppose you are changing a small part of a more significant part of the codebase. in that case, you can specify both the larger and smaller scopes in the commit message for clarity (e.g., if you were changing something in internal streams, the commit could be something like `stream/internal: fix object not being handled properly`).

if you think a change deserves further explanation, we encourage you to write a short explanation in the commit message ([example](https://github.com/imputnet/cobalt/commit/d2e5b6542f71f3809ba94d56c26f382b5cb62762)), which will save both you and us time having to enquire about the change, and you explaining the reason behind it.

if your contribution has uninformative commit titles, you may be asked to interactively rebase your branch and amend each commit to include a meaningful title.

### clean commit history
if your branch is out of date and/or has some merge conflicts with the `current` branch, you should **rebase** it instead of merging. this prevents meaningless merge commits from being included in your branch, which would then end up in the cobalt git history.

if you find a mistake or bug in your code before it's merged or reviewed, instead of making a brand new commit to fix it, it would be preferable to amend that specific commit where the mistake was first introduced. this also helps us easily revert a commit if we discover that it introduced a bug or some unwanted behavior.
- if the commit you are fixing is the latest one, you can add your files to staging and then use `git commit --amend` to apply the change.
- if the commit is somewhere deeper in your branch, you can use `git commit --fixup=HASH`, where *`HASH`* is the commit you are fixing.
    - afterward, you must interactively rebase your branch with `git rebase -i current --autosquash`.
      this will open up an editor, but you don't need to do anything else except save the file and exit.
- once you do either of these things, you will need to do a **force push** to your branch with `git push --force-with-lease`.
