import { render, screen } from "@testing-library/react";
import ProjectCard from "../components/ProjectCard";

jest.mock("next/link", () => {
  return function Link({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

test("ProjectCard renders project title and status", () => {
  const project = {
    _id: "1",
    title: "Demo Project",
    description: "Project description",
    status: "active",
    coverUrl: ""
  };

  render(<ProjectCard project={project} />);

  expect(screen.getByText("Demo Project")).toBeInTheDocument();
  expect(screen.getByText("active")).toBeInTheDocument();
});

test("ProjectCard renders open link", () => {
  const project = {
    _id: "1",
    title: "Demo Project",
    description: "Project description",
    status: "active",
    coverUrl: ""
  };

  render(<ProjectCard project={project} />);

  expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute("href", "/projects/1");
});
