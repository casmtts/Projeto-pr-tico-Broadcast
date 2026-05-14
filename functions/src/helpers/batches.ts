export const chunk = <T>(items: T[], size: number) =>
  items.reduce<T[][]>((groups, item, index) => {
    if (index % size === 0) {
      groups.push([]);
    }
    groups[groups.length - 1].push(item);
    return groups;
  }, []);
