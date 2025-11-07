import { lazy, Suspense } from 'react';
import type { GroupBase, OptionsOrGroups, Props as SelectProps } from 'react-select';

// Lazy load react-select as it's a heavy library (~50KB)
// With optimizeDeps including react-select, the module should resolve correctly
const Select = lazy(() => 
  import('react-select').then((module) => ({
    default: module.default || module,
  }))
);

interface LazySelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> extends SelectProps<Option, IsMulti, Group> {
  fallback?: React.ReactNode;
}

const SelectFallback = () => (
  <div className="h-10 bg-dark-100 rounded-lg animate-pulse" />
);

const LazySelect = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ fallback = <SelectFallback />, ...props }: LazySelectProps<Option, IsMulti, Group>) => {
  return (
    <Suspense fallback={fallback}>
      <Select<Option, IsMulti, Group> {...props} />
    </Suspense>
  );
};

export default LazySelect;

