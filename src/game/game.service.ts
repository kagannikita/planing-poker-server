import { Injectable } from '@nestjs/common';

type resultsType = {
  cards: { name: string; scoreTypeShort: string; image: string }[]
  values: number[]
}

@Injectable()
export class GameService {

  count(arr: string[]) {
    const obj = arr.reduce((acc, cur) => {
      acc[cur] = (acc[cur] || 0) + 1;
      return acc
    }, new Map())
    return obj
  }

  sumScore(issueValues: IterableIterator<string>) {
    const arr = Array.from(issueValues)
    const obj = this.count(arr);

    return obj
  }

  getRoundResult = (issueScore: {[key: string]: number} ) => {
    const arrayOfFinalCards: [string, number][] = []

    // const results: resultsType = {
    //   cards: [],
    //   values: [],
    // }

    for (const key in issueScore) {
      arrayOfFinalCards.push([key, issueScore[key]])
    }

    const sortedArray = arrayOfFinalCards.concat().sort((a, b) => {
      return a[1] - b[1]
    })
    
    return sortedArray
    // sortedArray.reverse().forEach((item) => {
    //   const card = {
    //     name: item[0],
    //     image: dataSocket?.lobbyData?.settings?.cards[0].image,
    //     scoreTypeShort: dataSocket?.lobbyData?.settings?.score_type_short,
    //   }
    //   results.cards.push(card)
    //   results.values.push(item[1])
    // })

  }
}
