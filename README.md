# Spring 2023 ECE 461 Project Part 2
###### Brian Yuan, Koltan Hauersperger, Grayson Nocera, Shantanu Sinha
Part 1 codebase inherited from Haley Huntington, Sam Dlott, Hamzah Kamel, Paretosha Singh
## CLI for Trustworthy Modules
This project aims to use REST API, GraphQL API, and local repository cloning to get metrics (bus factor, correctness, ramp up, responsive maintainer, license) of how trustworthy different packages and repositories are, and to rate these packages and repositories based off a "net score" using the metrics measured.

### Interaction

```./run install```
- Installs any dependencies
- Prints number of packages installed in accordance with the Sample I/O files on BrightSpace
- Returns 0 on `EXIT_SUCCESS`

```./run build ```
- Transpiles the TypeScript programs
- Returns 0 on `EXIT_SUCCESS`

```./run URL_FILE```
- URL_FILE is the absolute location of a file consisting of an ASCII-encoded newline-delimited set of URLs.
    - These URLs may be in the npmjs.com domain (e.g. https://www.npmjs.com/package/even) or come directly from GitHub (e.g. https://github.com/jonschlinkert/even)
    - Rates the package from [0, 1] as a weighted sum of package attributes
    - Outputs the Packages to Stdout in descending order of Net Score in a new-line delimited JSON format
- Returns 0 on `EXIT_SUCCESS`

```/run test```
- Prints to stdout how many tests cases passed, as well as the line coverage achieved
 `X/Y test cases passed. Z% line coverage achieved.`
- Returns 0 on `EXIT_SUCCESS`

### Rating System
#### Ramp-up Time
Determines how easy it will be for a new engineer to get familiar with the package - good documentation, frequency of comments, README length, etc.
#### Correctness
Determines how reliable the package is using the number of issues, the number of commits, and the working lifetime of the project from the date it was created to the date of the last commit.
#### Bus Factor
Finds the number of people who can work on the package at any given moment. Also takes into account the number of recent commits in a timeframe of the past three months.
#### Responsiveness
Determines how "responsive" the package is to issues, commits, pull requests, etc. Takes into account the number of total commits, issues created recently, and the ratio of closed issues to open issues.
#### License Compatibility
Does the package have a license? If yes, then it will receive a high score. If no... then low. 

#### Net Score
Based on the above metrics, the net score will be their weighted sum on a scale from 0 to 1 inclusive using the following formula:  
  
```(0.35 ∗ bF) + (0.25 ∗ L) + (0.2 ∗ C) + (0.1 ∗ rU) + (0.1 ∗ rM) = nS```  
  
where ```bF``` is the bus factor; ```L``` is license; ```C``` is correctness; ```rU``` is ramp up; ```rM``` is responsive Maintainer; and ```nS``` is the net score of the package overall.
