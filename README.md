# Note taking app with mentions
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It is a note taking app which allows mentions inside each note which are retrieved from a given endpoint when a user types @.

I have used Typescript for this project and SASS modules for the styling. I chose to use SASS modules over other methods such as tailwind, as I personally find it easier to work with and gives a clearer structure to follow. It allows me to keep all relevant files for the component together which makes the project easy to manage and isolates styling which therfore minimises the risk of any interferance.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Project Scope & Requirements

The requirements for this project were as follows:

- Create a working text-area where the user can input some free plain text..
- The note should auto-save when the user stops typing (posted to given endpoint)
- The note should load again on page refresh. (fetched from given endpoint)
- A user can mention other users from the text-area
- When typing the character @... a list of names should appear (fetched from given endpoint)
- The available users to mention should be updated when the user types
- Only the 5 most relevant results should be displayed
- The mention should have a special style


## Considerations & Decisions

- I added a 'last updated' feature which initially shows to the user as '-'. The time only updates if the content of the note changes. I used local storage to save this updated time as the endpoint didnt accept it as part of the payload otherwise I would have stored it here.
- I used textarea for the note as this is what was specified on the requirements, however a better approach would have been to use a editable div. This would have enabled me to style the text inside in a more simple way instead of having to create an overlay. It also would have enabled me to use a more simple approach with cursor positioning.
- I made the mentions accessible for users 
- I considered the title of the note being editable but due to payload restraints i didnt implement. Also this wasnt explicity specified on this requirements.
- I extracted out functions where possible and tested these separately
- I extracted out the endpoints into its own file so they could easily be reused throughout the codebase.
- I extracted types into their own file to make them central and easy to manage
