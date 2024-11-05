# contributing to cobalt
if you're reading this, you are probably interested in contributing to cobalt, which we are very thankful for :3

this document serves as a guide to help you make contributions that we can merge into the cobalt codebase.

## translations
we are currently accepting translations via the [i18n platform](https://i18n.imput.net).

thank you for showing interest in making cobalt more accessible around the world, we really appreciate it! here are some guidelines for how a cobalt translation should look:

- cobalt's writing style is informal. please do not use formal language, unless there is no other way to express the same idea of the original text in your language.
- all cobalt text is written in lowercase. this is a stylistic choice, please do not capitalize translated sentences.
- do not translate the name "cobalt", or "imput"
- you can translate "meowbalt" into whatever your language's equivalent of _meow_ is (e.g. _miaubalt_ in German)
- **please don't translate cobalt into languages which you are not experienced in.** we can use google translate ourselves, but we would prefer cobalt to be translated by humans, not computers.

if your language does not exist on the translation platform yet, you can request to add it by adding it to any of cobalt's components (e.g. [here](https://i18n.imput.net/projects/cobalt/about/)).

before translating a piece of text, check that no one has made a translation yet. pending translations are displayed in the **Suggestions** tab on the translate page. if someone already made a suggestion, and you think it's correct, you can upvote it! this helps us distinguish that a translation is correct.

if no one has submitted a translation, or the submitted translation seems wrong to you, you can submit your translation by clicking the **Suggest** button for each individual string, which sends it off for human review. we will then check it to to ensure no malicious translations are submitted, and add it to cobalt.

if any translation string's meaning seems unclear to you, please leave a comment on the *Comments* tab, and we will either add an explanation or a screenshot.

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

the scope is not strictly defined, you can write whatever you find most fitting for the particular change. suppose you are changing a small part of a more significant part of the codebase. in that case, you can specify both the larger and smaller scopes in the commit message for clarity (e.g., if you were changing something in internal streams, the commit could be something like `api/stream: fix object not being handled properly`).

if you think a change deserves further explanation, we encourage you to write a short explanation in the commit message ([example](https://github.com/imputnet/cobalt/commit/31be60484de8eaf63bba8a4f508e16438aa7ba6e)), which will save both you and us time having to enquire about the change, and you explaining the reason behind it.

if your contribution has uninformative commit titles, you may be asked to interactively rebase your branch and amend each commit to include a meaningful title.

### clean commit history
if your branch is out of date and/or has some merge conflicts with the `current` branch, you should **rebase** it instead of merging. this prevents meaningless merge commits from being included in your branch, which would then end up in the cobalt git history.

if you find a mistake or bug in your code before it's merged or reviewed, instead of making a brand new commit to fix it, it would be preferable to amend that specific commit where the mistake was first introduced. this also helps us easily revert a commit if we discover that it introduced a bug or some unwanted behavior.
- if the commit you are fixing is the latest one, you can add your files to staging and then use `git commit --amend` to apply the change.
- if the commit is somewhere deeper in your branch, you can use `git commit --fixup=HASH`, where *`HASH`* is the commit you are fixing.
    - afterward, you must interactively rebase your branch with `git rebase -i current --autosquash`.
      this will open up an editor, but you don't need to do anything else except save the file and exit.
- once you do either of these things, you will need to do a **force push** to your branch with `git push --force-with-lease`.
