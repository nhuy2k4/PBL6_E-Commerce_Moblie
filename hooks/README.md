# Shared Hooks

Common React hooks that can be used in both web and mobile applications.

## Available Hooks

### 1. `useProducts`

Hook for fetching and managing products.

```typescript
import { useProducts } from "@shared/hooks";

// Auto-load all products on mount
const { products, loading, error, loadProducts, searchProducts } =
  useProducts();

// Load products by category
const { products, loading } = useProducts({ categoryId: 1 });

// Manual loading (no auto-load)
const { products, loadProducts } = useProducts({ autoLoad: false });
```

**Methods:**

- `loadProducts()` - Load all products
- `loadProductsByCategory(categoryId)` - Load products by category
- `searchProducts(query)` - Search products
- `refresh()` - Reload current products

---

### 2. `useAuthStorage`

Hook for managing authentication storage (platform-agnostic).

```typescript
import { useAuthStorage } from "@shared/hooks";

const { token, user, isAuthenticated, setToken, clearAuth, setUser } =
  useAuthStorage({
    tokenKey: "token",
    onTokenChange: (token) => console.log("Token changed:", token),
  });
```

**Note:** This hook provides storage state management. You need to implement actual storage (localStorage/AsyncStorage) in platform-specific code.

---

### 3. `useAsync`

Hook for managing async operations with loading/error states.

```typescript
import { useAsync } from "@shared/hooks";
import { login } from "@shared/services/authService";

const { data, loading, error, execute } = useAsync(login, {
  onSuccess: (user) => console.log("Login success:", user),
  onError: (err) => console.error("Login failed:", err),
});

// Execute the async function
const handleLogin = () => {
  execute({ username: "test", password: "123" });
};
```

**Methods:**

- `execute(...args)` - Execute the async function
- `reset()` - Reset state
- `setData(data)` - Manually set data

---

### 4. `useForm`

Hook for managing form state and validation.

```typescript
import { useForm } from "@shared/hooks";
import { isValidEmail } from "@shared/utils";

const {
  values,
  errors,
  touched,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
} = useForm({
  initialValues: {
    email: "",
    password: "",
  },
  validationRules: {
    email: [
      {
        validate: (value) => isValidEmail(value),
        message: "Invalid email format",
      },
    ],
    password: [
      {
        validate: (value) => value.length >= 8,
        message: "Password must be at least 8 characters",
      },
    ],
  },
  onSubmit: async (values) => {
    console.log("Form submitted:", values);
  },
});

// In component
<input
  value={values.email}
  onChange={(e) => handleChange("email")(e.target.value)}
  onBlur={handleBlur("email")}
/>;
{
  touched.email && errors.email && <span>{errors.email}</span>;
}
```

---

### 5. `useDebounce`

Hook for debouncing values (useful for search inputs).

```typescript
import { useDebounce } from "@shared/hooks";
import { useState } from "react";

const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 500); // 500ms delay

useEffect(() => {
  if (debouncedQuery) {
    // Perform search with debounced value
    searchProducts(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

## Usage Examples

### Mobile (React Native)

```typescript
import { useProducts, useDebounce } from "@shared/hooks";
import { View, TextInput, FlatList } from "react-native";

export default function ProductsScreen() {
  const { products, loading, searchProducts } = useProducts();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchProducts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search products..."
      />
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
```

### Web (React)

```jsx
import { useProducts, useDebounce } from "@shared/hooks";
import { useState, useEffect } from "react";

export default function ProductsPage() {
  const { products, loading, searchProducts } = useProducts();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchProducts(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <div>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Benefits

✅ **Reusable** - Write once, use in both web and mobile  
✅ **Type-safe** - Full TypeScript support  
✅ **Consistent** - Same API across platforms  
✅ **Maintainable** - Fix bugs in one place  
✅ **Testable** - Easy to unit test hooks

---

## Platform-Specific Considerations

Some hooks (like `useAuthStorage`) provide the logic but require platform-specific storage implementation:

**Mobile (AsyncStorage):**

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = {
  get: (key) => AsyncStorage.getItem(key),
  set: (key, value) => AsyncStorage.setItem(key, value),
  remove: (key) => AsyncStorage.removeItem(key),
};
```

**Web (localStorage):**

```javascript
const storage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};
```
