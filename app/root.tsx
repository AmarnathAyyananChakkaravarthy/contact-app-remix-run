import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import { LinksFunction,LoaderFunctionArgs,redirect } from "@remix-run/node";
import appStylesHref from './app.css?url';

import { getContacts, createEmptyContact } from "./data";
import { useEffect } from "react";


export const links: LinksFunction= () =>[
  {
    rel:"stylesheet", href: appStylesHref
  },
]

export const loader = async ({
  request
}:LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts , q });
}

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`)
  
}

export default function App() {

  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  useEffect(()=>{
    const searchElement=document.getElementById("q");
    if(searchElement instanceof HTMLInputElement){
      searchElement.value = q || "";
    }
  },[q])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form 
              id="search-form"
              onChange={(event)=>{
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }} 
              role="search">
              <input
                defaultValue={q || ""}
                className={searching?"loading":""}
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
          {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                     className = { ({isActive, isPending}) => 
                      isActive
                        ? "active"
                        : isPending 
                        ? "pending"
                        :""
                     }
                     to={`contacts/${contact.id}`}>
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div 
          className={
            navigation.state === "loading" && !searching
            ? "loading" : ""
          }
          id="detail">
          <Outlet/>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
