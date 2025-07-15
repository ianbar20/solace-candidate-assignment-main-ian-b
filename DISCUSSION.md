## src/db/index.ts and src/app/api/seed/route.ts

`db` was union-typed, and one of the types did not have an `insert` method. To fix, I made the case of a missing URL return null, rather than `select: () => ({
from: () => [],
})`

In addition, I added a case in src/app/api/seed/route.ts to check for a null `db` before attempting db.insert().

Finally, I added an explicit return type annotation to setup(), as it defines a clear, predictable contract for the function, as well as preventing type widening.

## src/app/api/advocates/route.ts

The original intention of this file was to allow the mock data in src/db/seed/advocates.ts to be used. Unfortunately to do so, a developer has to manually go in to the file, uncomment code, save it, commit it, redeploy, etc...  A much more efficient approach is to simply use the mock data when a USE_MOCK_DB environment variable is set to TRUE. This way, a developer can decide to use mock data when running the app by simply setting that environment variable to true.

One may be tempted to move this logic to `src/db/index.ts`, but in my opinion that file should always return the real DB, in order to separate the DB setup logic from the rest of the app.

## src/db/seed/advocates.ts
advocateData's phoneNumber property should not be a number, as Typescript cannot represent all phone numbers as unique numbers, for example a phone number 0001113333 would lose the leading zeroes will be ommitted, and would be stored as the number 1113333. I fixed by changing the mock numbers to strings, and modifying the Drizzle schema to use text for that property.

advocateData is exported as type any[]. Instead, we can infer the type that our Drizzle schema expects, so that the mock data matches the schema type exactly. 

randomSpecialty() is suspicious and I wonder if it could produce invalid ranges. I will have to come back to this, as the issue isn't glaring yet. In addition, the method name indicates it returns one specialty, but this method can return multiple specialties.
Edit: after coming back to it, I have decided this method should return a truly random set of specialties in order to provide a wide variety of mock data cases. This also matches the real world case where some advocates may have many specialties, or only one. As such, I renamed the method to randomSpecialties(). 

Regarding math logic in this method, I sensed something was off. First I see a hardcoded number, which always gives me pause. I see the hardcoded number is the same as specialties.length, so I imagine 24 is meant to represent that length. Since the list of specialties is likely to change, we should directly reference its length rather than using 24.

Even with this change, testing some random  values for random1 gave me further pause. I noticed that the higher the value for random1, the less specialties are returned. IE if random1 is 23, only 1 specialty is returned.  It also always returned specialties that were adjacent to eachother in the list, which is not random at all. To fix this uneven distrubution, I found it easiest to generate a random number of specialties to be returned, shuffle the list of specialties, and then take a slice of that randomized list.
for a little more detail on my shuffle logic, I subtract 0.5 from Math.random() so that the final value can be used as a comparator in the sort method. If I just used Math.random(), values would always be positive and the shuffling would not be random, leading me to my current method.

```const randomSpecialties = (): string[] => {
  // random number of specialties to be returned, between 1 and specialties.length
  const maxCount = Math.floor(Math.random() * specialties.length) + 1;
  // randomize order of specialties
  const shuffled = [...specialties].sort(() => Math.random() - 0.5);
  // return maxCount number of randomized specialties
  return shuffled.slice(0, maxCount);
};
```

I then remember from my early CS classes in college that the JS .sort() method is not truly random. I can't remember the exact reason for this, so a quick stackoverflow search explains that not all permutations are possible using this method. The article suggests a Fisher-Yates shuffle: 

```const fisherYatesShuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
```

I believe true randomness is not necessary for randomizing mock data such as this, and my initial method will likely produce random ENOUGH results. I stick with my initial method because I don't have time to properly test the suggested fisher-yates implementation. Always good to test code found online, even ones with a lot of upvotes.

## src/db/migrate.js
Since this is a node script that is run with "npm run migrate:up" .env files are not automatically loaded, so we run `require("dotenv").config();` at the start.

when calling runMigration(), we want to follow node 20+ best practices and run in a try/catch block.

the migrations folder is hard coded, this can change in the future and needs to be easily configurable. I add an environment variable for that folder name.

## package.json 
Taking a look at the versions of these packages and running `npm outdated` shows me quite a few of these are outdated, and may cause issues. I run `npm update` and also install the latest Node and Tailwindcss versions, for sake of familiarity with those versions.

## .gitignore
We want to commit drizzle/_meta/_journal.js and the .sql migrations within drizzle because they track schema history and what migrations have already run. We do not want to commit any other files in this directory, for concern of merge conflicts.

## package.json
I upgraded next and tailwind to latest, for familiarity. I had to update globals.css and postcss.config.mjs to match the latest version expectations.

## src/app/page.tsx
upon running the app locally, I notice that search is not changing the result list. I fix this and allow advocates to be searched for by name, location, or specialty. This is nice because a patient can search for a specific city.

 I also start to get an idea of some packages I may want to use, possibly tippyjs for tooltips and react-select for filter inputs. I also begin looking at Solace's website for an idea of colors, fonts, and general look of a Solace webpage. 

A few of these columns can be consolidated, such as first,last, degree. This saves space on the table and makes it easier to read.

States were omitted from the advocate schema, so I add states. There is too much ambiguity with just a city name to define an advocates location.

I see that we display specialties within the table, and specialties are at least a few lines of content. I truncate the specialty column in the table and add a Tippy tooltip to view the full content. I do not love how sometimes the tooltip appears above the content, I would put some work in to making that more consistent.

I think the list view could really use a detail view to accompany it, so I build AdvocateModal.tsx to display details about a single advocate when their row is clicked in the table.

I spent some time adding some quick accessibility features, such as aria labels, keyboard navigable inputs, proper heading structure, and roles.

## Future improvements
Given more time, I would add a unit test suite (jest).
I would also improve responsive design by cleaning up the mobile layout, as right now a decent portion of the screen is taken up by filters. In addition, the user is forced to scroll across the table width which is not ideal.

I would add more accessibility features such as ensuring proper color contrast on all text.

I don't love how the app looks with just tailwind, I would likely use a more aesthetically pleasing component library such as Joy UI.

The phone column is likely not necessary in the table, as it's unlikely a patient cares about a phone number until they've selected an advocate based on other criteria. therefore it could probably just be displayed in the detail modal. I would double check the business requirements of this table before taking away the phone number. If we do want to show the phone column, I left it wide enough to fit up to 14 digits with country codes. Rare case, but some international phone numbers are longer.

I don't think that it's realistic that an advocate has a random number of specialties, now that I think about it. I would research the average number of specialties someone in this role has, and generate about that number of specialties. 

The gradient background looks okay but I would opt for something more interesting. not sure what yet. 

The specialties filter should definitely be a multiselect, but the selections with my current design are truncated with no tooltip. In addition, it grows vertically in an ugly way. I could fix this with a custom style on that select component.

I also did not extensively test the application of the Mollie Glaston font that Solace uses on their site. I would spend more time testing this, and ideally finding a web-hosted version of the font.

Eventually proper routing would be nice too, at the moment this is just a single page app and it could likely grow. Even right now, a unique URL when viewing the advocate detail page could be nice if the patient wants to save the URL for later.

I also experience a hydration error, I spent some time hunting it down but have not found a solution yet. In the future I would fix this.